import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

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

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController
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
    try {
      if (!window.Square) {
        console.error(' Square.js not loaded. Make sure the script is in index.html');
        return;
      }

      const payments = await window.Square.payments(
        'sandbox-sq0idb-rcmpXa2f9w89vZ2Ofx1ihA', // Sandbox Application ID
        'LBDH1N4BQMXW1'                          // Sandbox Location ID
      );

      this.card = await payments.card();
      await this.card.attach('#card-container');
      console.log(' Square Card attached to #card-container');
    } catch (err) {
      console.error(' Square init failed:', err);
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
  if (!this.UserID) {
    console.error(' User not logged in');
    return;
  }

  if (!this.card) {
    console.error(' Card element not initialized');
    return;
  }

  if (this.cartItems.length === 0) {
    console.error(' Cart is empty');
    return;
  }

  const successfulOrders: any[] = [];

  // Process each cart item individually
  for (const item of this.cartItems) {
    try {
      const orderData = await this.processSinglePurchase(item);
      successfulOrders.push(orderData);
      console.log(`✅ Successfully purchased ${item.quantity} tickets for ${item.title}`);
    } catch (error) {
      console.error(`❌ Failed to purchase tickets for raffle ${item.raffleId}:`, error);
      const errorDiv = document.getElementById('card-errors');
      if (errorDiv) errorDiv.innerText = `Failed to purchase ${item.quantity} tickets for ${item.title}. Please try again.`;
      return;
    }
  }

  // Clear cart after all successful purchases
  this.clearCart();

  // Navigate with the orders data in state
  if (successfulOrders.length > 0) {
    if (successfulOrders.length === 1) {
      // Single order - go directly to that order details
      this.router.navigate(['/orders', successfulOrders[0].orderId]);
    } else {
      // Multiple orders - go to first order but pass all orders in state
      this.router.navigate(['/orders', successfulOrders[0].orderId], {
        state: { allOrders: successfulOrders }
      });
    }
  }
}

private async processSinglePurchase(item: CartItem): Promise<any> {
  return new Promise((resolve, reject) => {
    // Tokenize for each purchase
    this.card.tokenize().then((result: any) => {
      if (result.status !== 'OK') {
        const errorMsg = result.errors?.[0]?.message || 'Payment failed';
        console.error(' Tokenization failed:', result.errors);
        reject(new Error(errorMsg));
        return;
      }

      const paymentToken = result.token;
      const userId = this.UserID!;
      const raffleId = typeof item.raffleId === 'object' ? item.raffleId['_id'] : item.raffleId;
      const ticketsBought = item.quantity;

      console.log('🛒 Processing purchase:', { userId, raffleId, ticketsBought });

      // Call the backend API for this specific raffle
      this.apiService.purchaseSingleRaffleTickets(userId, raffleId, ticketsBought, paymentToken)
        .subscribe(
          (res) => {
            console.log('✅ Single purchase success:', res);
            resolve(res); // Return the order data
          },
          (error) => {
            console.error('❌ Single purchase failed:', error);
            reject(error);
          }
        );
    }).catch((err: any) => {
      console.error('❌ Tokenization error:', err);
      reject(err);
    });
  });
}

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }
}
