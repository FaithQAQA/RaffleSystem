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
      message: `Your order #${orderData.orderId} has been processed successfully. A receipt has been sent to your email. Please check your Spam or Junk folder if you don’t see it in your inbox.`,
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

    try {
      const result = await this.card.tokenize();

      if (result.status !== 'OK') {
        const errorMsg = result.errors?.[0]?.message || 'Payment failed';
        console.error(' Tokenization failed:', result.errors);
        const errorDiv = document.getElementById('card-errors');
        if (errorDiv) errorDiv.innerText = errorMsg;
        return;
      }

      const paymentToken = result.token;
      let successfulPurchases = 0;
      let lastOrderData: any = null;

      // Loop through items in cart and purchase tickets
      for (const item of this.cartItems) {
        const raffleId = item.raffleId;
        const userId = this.UserID!;
        const ticketsBought = item.quantity;

        try {
          const res = await this.apiService
            .purchaseTickets(raffleId, userId, ticketsBought, paymentToken)
            .toPromise();

          console.log(` Success for raffle ${raffleId}:`, res);
          successfulPurchases++;
          lastOrderData = res; // Store the last order data for confirmation
        } catch (err) {
          console.error(` Error purchasing for raffle ${raffleId}:`, err);
        }
      }

      if (successfulPurchases > 0) {
        this.clearCart();

        if (successfulPurchases === this.cartItems.length) {
          // All purchases successful
          await this.showOrderConfirmation(lastOrderData);
        } else {
          // Some purchases failed
          await this.showSuccessPopup();
        }
      }
    } catch (err) {
      console.error(' Error during tokenize:', err);
    }
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }
}
