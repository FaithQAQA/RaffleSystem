import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { SharedDataService } from 'src/app/services/shared-data.service';

interface CartItem {
  raffleId: string;
  title?: string;
  quantity: number;
  totalCost: number;
}

declare global {
  interface Window {
    Square: any;
  }
}

@Component({
  selector: 'app-view-cart',
  templateUrl: './view-cart.page.html',
  styleUrls: ['./view-cart.page.scss'],
  standalone: false,
})
export class ViewCartPage implements OnInit, AfterViewInit {
  cartItems: CartItem[] = [];
  totalCost = 0;
  taxRate = 0.13; // 13% tax
  taxAmount = 0;
  totalWithTax = 0;
  cartItemCount = 0;
  UserID = localStorage.getItem('userId');
  private card: any; // Square Card instance
  private payments: any; // Square payments instance
  private isProcessing = false; // Prevent multiple simultaneous purchases

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController,
    private sharedData: SharedDataService // Add this

  ) {}

  ngOnInit(): void {
    // Subscribe to cart state
    this.apiService.cart$.subscribe((items) => {
      this.cartItems = items || [];
      this.loadRaffleDetails();
      this.calculateTotals();
    });

    this.apiService.cartCount$.subscribe((count) => {
      this.cartItemCount = count;
    });

    this.apiService.loadCart();
  }

  async ngAfterViewInit() {
    await this.initializeSquare();
  }

  async initializeSquare() {
    try {
      if (!window.Square) {
        console.error('❌ Square.js not loaded. Make sure the script is in index.html');
        return;
      }

      this.payments = await window.Square.payments(
        'sandbox-sq0idb-rcmpXa2f9w89vZ2Ofx1ihA', // Sandbox Application ID
        'LBDH1N4BQMXW1'                          // Sandbox Location ID
      );

      this.card = await this.payments.card();
      await this.card.attach('#card-container');
      console.log('✅ Square Card attached to #card-container');
    } catch (err) {
      console.error('❌ Square init failed:', err);
    }
  }

  loadRaffleDetails() {
    this.cartItems.forEach((item) => {
      const raffleId =
        typeof item.raffleId === 'object' ? item.raffleId['_id'] : item.raffleId;

      if (!raffleId) return;

      this.apiService.getRaffleById(raffleId).subscribe(
        (raffle) => {
          item.title = raffle.title;
          item.raffleId = raffle._id;
        },
        (error) => console.error('Error fetching raffle details:', error)
      );
    });
  }

  calculateTotals() {
    // Calculate subtotal
    this.totalCost = this.cartItems.reduce((sum, item) => sum + item.totalCost, 0);

    // Calculate tax amount (rounded to 2 decimal places)
    this.taxAmount = Math.round(this.totalCost * this.taxRate * 100) / 100;

    // Calculate total with tax (rounded to 2 decimal places)
    this.totalWithTax = Math.round((this.totalCost + this.taxAmount) * 100) / 100;
  }

  // Helper methods for template formatting
  getSubtotal(): number {
    return Math.round(this.totalCost * 100) / 100;
  }

  getTaxAmount(): number {
    return Math.round(this.totalCost * this.taxRate * 100) / 100;
  }

  getTotalWithTax(): number {
    return Math.round((this.totalCost + this.getTaxAmount()) * 100) / 100;
  }

  formatCurrency(amount: number): string {
    return amount.toFixed(2);
  }

  removeItem(item: CartItem) {
    this.apiService.removeFromCart(item.raffleId);
  }

  clearCart() {
    this.apiService.clearCart();
    this.ngOnInit();
  }

  async showSuccessPopup() {
    const alert = await this.alertController.create({
      header: 'Success',
      message: 'Tickets purchased successfully!',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.router.navigate(['/view-raffles']);
          },
        },
      ],
    });

    await alert.present();
  }

  async showOrderConfirmation(orderData: any) {
    const alert = await this.alertController.create({
      header: 'Order Confirmed!',
      message: `Your order #${orderData.orderId} has been processed successfully. A receipt has been sent to your email. Please check your Spam or Junk folder if you don't see it in your inbox.`,
      buttons: [
        {
          text: 'View Order',
          handler: () => {
            this.router.navigate(['/orders', orderData.orderId]);
          },
        },
        {
          text: 'Continue Shopping',
          handler: () => {
            this.router.navigate(['/view-raffles']);
          },
        },
      ],
    });

    await alert.present();
  }

  async buyTickets() {
    if (this.isProcessing) {
      console.log('⚠️ Purchase already in progress');
      return;
    }

    if (!this.UserID) {
      console.error('❌ User not logged in');
      return;
    }

    if (!this.card) {
      console.error('❌ Card element not initialized');
      return;
    }

    if (this.cartItems.length === 0) {
      console.error('❌ Cart is empty');
      return;
    }

    this.isProcessing = true;
    const successfulOrders: any[] = [];
    const failedPurchases: { item: CartItem, error: any }[] = [];

    try {
      // Process each cart item individually with fresh tokens
      for (const item of this.cartItems) {
        try {
          const orderData = await this.processSinglePurchaseWithRetry(item, 3); // 3 retry attempts
          successfulOrders.push(orderData);
          console.log(`✅ Successfully purchased ${item.quantity} tickets for ${item.title}`);
        } catch (error) {
          console.error(`❌ Failed to purchase tickets for raffle ${item.raffleId}:`, error);
          failedPurchases.push({ item, error });
        }
      }

      // Handle results
      if (failedPurchases.length === 0) {
        // All purchases successful
        this.clearCart();
        await this.showSuccessAlert(successfulOrders);
      } else if (successfulOrders.length > 0) {
        // Some succeeded, some failed
        this.clearCart(); // Clear successful items
        await this.showPartialSuccessAlert(successfulOrders, failedPurchases);
      } else {
        // All failed
        await this.showFailureAlert(failedPurchases);
      }

    } catch (error) {
      console.error('❌ Unexpected error during purchase process:', error);
      await this.showGenericErrorAlert();
    } finally {
      this.isProcessing = false;
    }
  }

  private async processSinglePurchaseWithRetry(item: CartItem, maxRetries: number): Promise<any> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Purchase attempt ${attempt} for ${item.title}`);

        const result = await this.processSinglePurchase(item);
        return result;

      } catch (error: any) {
        lastError = error;

        // Check if we should retry based on error type
        const shouldRetry = this.shouldRetryPurchase(error);

        if (!shouldRetry || attempt === maxRetries) {
          throw error; // Don't retry or max retries reached
        }

        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await this.delay(delay);

        // Re-initialize Square card for fresh token
        await this.reinitializeSquareCard();
      }
    }

    throw lastError;
  }

  private shouldRetryPurchase(error: any): boolean {
    // Retry for token-related errors
    if (error?.error?.includes('token') ||
        error?.error?.includes('expired') ||
        error?.error?.includes('session') ||
        error?.shouldRetry) {
      return true;
    }

    // Don't retry for these errors
    if (error?.error?.includes('declined') ||
        error?.error?.includes('insufficient') ||
        error?.error?.includes('invalid card') ||
        error?.error?.includes('limit exceeded')) {
      return false;
    }

    return false; // Default: don't retry
  }

  private async reinitializeSquareCard() {
    try {
      // Detach current card
      if (this.card) {
        await this.card.destroy();
      }

      // Create new card instance
      this.card = await this.payments.card();
      await this.card.attach('#card-container');
      console.log('✅ Square Card reinitialized');
    } catch (error) {
      console.error('❌ Failed to reinitialize Square card:', error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async processSinglePurchase(item: CartItem): Promise<any> {
    return new Promise((resolve, reject) => {
      // Generate fresh token for each purchase
      this.card.tokenize().then((result: any) => {
        if (result.status !== 'OK') {
          const errorMsg = result.errors?.[0]?.message || 'Payment tokenization failed';
          console.error('❌ Tokenization failed:', result.errors);
          reject(new Error(errorMsg));
          return;
        }

        const paymentToken = result.token;
        const userId = this.UserID!;
        const raffleId = typeof item.raffleId === 'object' ? item.raffleId['_id'] : item.raffleId;
        const ticketsBought = item.quantity;

        console.log('🛒 Processing purchase with fresh token:', {
          userId,
          raffleId,
          ticketsBought,
          tokenPrefix: paymentToken.substring(0, 10) + '...'
        });

        // Generate unique idempotency key for this transaction
        const idempotencyKey = this.generateIdempotencyKey();

        // Call the backend API for this specific raffle
        this.apiService.purchaseSingleRaffleTickets(
          userId,
          raffleId,
          ticketsBought,
          paymentToken,
          idempotencyKey // Pass the idempotency key
        ).subscribe(
          (res) => {
            console.log('✅ Single purchase success:', res);
            resolve(res);
          },
          (error) => {
            console.error('❌ Single purchase failed:', error);

            // Update error display
            const errorDiv = document.getElementById('card-errors');
            if (errorDiv) {
              errorDiv.innerText = error.error || 'Payment failed. Please try again.';
            }

            reject(error);
          }
        );
      }).catch((err: any) => {
        console.error('❌ Tokenization error:', err);
        reject(err);
      });
    });
  }

  private generateIdempotencyKey(): string {
    return `raffle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

private async showSuccessAlert(orders: any[]) {
  if (orders.length === 1) {
    const alert = await this.alertController.create({
      header: 'Purchase Successful!',
      message: `Your order #${orders[0].orderId} has been confirmed. A receipt has been sent to your email.`,
      buttons: [
        {
          text: 'View Order',
          handler: () => {
            this.router.navigate(['/orders', orders[0].orderId]);
          }
        },
        {
          text: 'Continue Shopping',
          handler: () => {
            this.router.navigate(['/view-raffles']);
          }
        }
      ]
    });
    await alert.present();
  } else {
    // Store orders in shared service BEFORE navigation
    this.sharedData.setRecentOrders(orders);

    const alert = await this.alertController.create({
      header: 'Purchases Successful!',
      message: `All ${orders.length} orders have been processed successfully. Receipts have been sent to your email.`,
      buttons: [
        {
          text: 'View Orders',
          handler: () => {
            // Navigate to first order - the OrderDetailsPage will get all orders from shared service
            this.router.navigate(['/orders', orders[0].orderId]);
          }
        },
        {
          text: 'Continue Shopping',
          handler: () => {
            this.router.navigate(['/view-raffles']);
          }
        }
      ]
    });
    await alert.present();
  }
}
  private async showPartialSuccessAlert(successful: any[], failed: any[]) {
    const alert = await this.alertController.create({
      header: 'Partial Success',
      message: `${successful.length} purchase(s) succeeded, but ${failed.length} failed. You may need to retry the failed purchases.`,
      buttons: [
        {
          text: 'View Successful Orders',
          handler: () => {
            this.router.navigate(['/orders']);
          }
        },
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  private async showFailureAlert(failedPurchases: any[]) {
    const alert = await this.alertController.create({
      header: 'Purchase Failed',
      message: 'All purchases failed. Please check your payment information and try again.',
      buttons: ['OK']
    });
    await alert.present();
  }

  private async showGenericErrorAlert() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'An unexpected error occurred. Please try again.',
      buttons: ['OK']
    });
    await alert.present();
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }
}
