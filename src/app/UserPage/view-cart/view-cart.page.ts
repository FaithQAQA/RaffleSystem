import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
interface CartItem {
  raffleId: string;
  title?: string; // Add title field to store raffle title
  quantity: number;
  totalCost: number;
}

@Component({
  selector: 'app-view-cart',
  templateUrl: './view-cart.page.html',
  styleUrls: ['./view-cart.page.scss'],
  standalone: false,
})
export class ViewCartPage implements OnInit {

  cartItems: CartItem[] = [];
  totalCost = 0;
  cartItemCount = 0;
        UserID=localStorage.getItem('userId');

  constructor(private apiService: ApiService, private router: Router, private alertController: AlertController,) {}

  ngOnInit(): void {
    this.apiService.cart$.subscribe((items) => {
      this.cartItems = items || [];
      this.loadRaffleDetails(); // Fetch raffle titles
      this.calculateTotal();
    });

    this.apiService.cartCount$.subscribe(count => {
      this.cartItemCount = count;
    });

    this.apiService.loadCart(); // Load cart initially
  }

  // Fetch raffle titles for each cart item
  loadRaffleDetails() {
    this.cartItems.forEach((item) => {
      const raffleId = typeof item.raffleId === 'object' ? item.raffleId['_id'] : item.raffleId; // Ensure it's a string
      if (!raffleId) {
        console.error('Invalid raffleId:', item.raffleId);
        return;
      }

      this.apiService.getRaffleById(raffleId).subscribe(
        (raffle) => {
          item.title = raffle.title;
          item.raffleId = raffle._id
        },
        (error) => console.error('Error fetching raffle details:', error)
      );
    });
  }


  // Calculate total cost dynamically
  calculateTotal() {
    this.totalCost = this.cartItems.reduce((sum, item) => sum + item.totalCost, 0);
  }

  // Remove item from cart
  removeItem(item: CartItem) {
    this.apiService.removeFromCart(item.raffleId);
  }

  clearCart() {
    this.apiService.clearCart()
    this.ngOnInit()
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

  buyTickets() {
    if (!this.UserID) {
      console.error('User not logged in');
      return;
    }

    this.cartItems.forEach((item) => {
      const raffleId = item.raffleId;
      const userId = this.UserID!;
      const ticketsBought = item.quantity;

      this.apiService.purchaseTickets(raffleId, userId, ticketsBought).subscribe({
        next: (res) => {
          console.log(`Success for raffle ${raffleId}:`, res);
          this.clearCart();
          this.showSuccessPopup();
        },
        error: (err) => console.error(`Error purchasing for raffle ${raffleId}:`, err),
      });
    });
  }


  // Logout function
  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }
}
