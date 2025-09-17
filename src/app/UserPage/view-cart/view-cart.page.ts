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

declare var Square: any; // 👈 tell TypeScript about global Square object
@Component({
  selector: 'app-view-cart',
  templateUrl: './view-cart.page.html',
  styleUrls: ['./view-cart.page.scss'],
  standalone: false,
})
export class ViewCartPage implements OnInit, AfterViewInit {
  cartItems: CartItem[] = [];
  totalCost = 0;
  cartItemCount = 0;
  UserID = localStorage.getItem('userId');
  private card: any; // Square card instance

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.apiService.cart$.subscribe((items) => {
      this.cartItems = items || [];
      this.loadRaffleDetails();
      this.calculateTotal();
    });

    this.apiService.cartCount$.subscribe((count) => {
      this.cartItemCount = count;
    });

    this.apiService.loadCart();
  }

 async ngAfterViewInit() {
  try {
    // Replace with your real App ID + Location ID
    const payments = await Square.payments(
      'sandbox-sq0idb-rcmpXa2f9w89vZ2Ofx1ihA', // Application ID
      'LBDH1N4BQMXW1'                         // Location ID
    );

    this.card = await payments.card();
    await this.card.attach('#card-container');
  } catch (err) {
    console.error('Square init failed:', err);
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

  calculateTotal() {
    this.totalCost = this.cartItems.reduce((sum, item) => sum + item.totalCost, 0);
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

async buyTickets() {
  if (!this.UserID) {
    console.error('User not logged in');
    return;
  }

  if (!this.card) {
    console.error('Card element not initialized');
    return;
  }

  try {
    const result = await this.card.tokenize();

    if (result.status !== 'OK') {
      const errorMsg = result.errors?.[0]?.message || 'Payment failed';
      const errorDiv = document.getElementById('card-errors');
      if (errorDiv) errorDiv.innerText = errorMsg;
      return;
    }

    const paymentToken = result.token;

    // Send token + raffle info to backend
    for (const item of this.cartItems) {
      const raffleId = item.raffleId;
      const userId = this.UserID!;
      const ticketsBought = item.quantity;

      this.apiService
        .purchaseTickets(raffleId, userId, ticketsBought, paymentToken)
        .subscribe({
          next: async (res) => {
            console.log(`Success for raffle ${raffleId}:`, res);
            this.clearCart();
            await this.showSuccessPopup();
          },
          error: (err) =>
            console.error(`Error purchasing for raffle ${raffleId}:`, err),
        });
    }
  } catch (err) {
    console.error('Error during tokenize', err);
  }
}

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }
}
