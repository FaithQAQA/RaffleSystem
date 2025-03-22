import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-products',
  templateUrl: './view-products.page.html',
  styleUrls: ['./view-products.page.scss'],
  standalone: false,
})
export class ViewProductsPage implements OnInit, OnDestroy {
showProductInfo: any;
toggleProductInfo() {
throw new Error('Method not implemented.');
}
  raffleId: string | null = null;
  raffle: any = {};
  quantity: number = 1;
  countdown: string = '';
  showInfo: boolean = false;

  private countdownInterval: any;

  constructor(private route: ActivatedRoute, private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.raffleId = this.route.snapshot.paramMap.get('id');
    console.log('Selected Raffle ID:', this.raffleId);
    this.getRaffleDetails(); // Fetch raffle details first
  }




  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  toggleInfo() {
    this.showInfo = !this.showInfo;
  }

  getRaffleDetails() {
    if (!this.raffleId) {
      console.error('Raffle ID is required!');
      return;
    }

    this.apiService.getRaffleById(this.raffleId).subscribe(
      (response) => {
        this.raffle = response;
        console.log('Raffle Details:', this.raffle);
        this.startCountdown(); // Start countdown after fetching raffle details
      },
      (error) => {
        console.error('Error:', error);
      }
    );
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }

  startCountdown() {
    if (!this.raffle || !this.raffle.startDate || !this.raffle.endDate) {
      console.error('Raffle startDate and endDate are required!');
      return;
    }

    const endTime = new Date(this.raffle.endDate).getTime();
    const now = new Date().getTime();

    if (endTime <= now) {
      this.countdown = 'Raffle has ended';
      return;
    }

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = endTime - now;

      if (timeLeft <= 0) {
        clearInterval(this.countdownInterval);
        this.countdown = 'Raffle has ended';
        return;
      }

      const months = Math.floor(timeLeft / (1000 * 60 * 60 * 24 * 30));
      const weeks = Math.floor((timeLeft % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24 * 7));
      const days = Math.floor((timeLeft % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      // Dynamically build the countdown string
      let countdownString = '';
      if (months > 0) countdownString += `${months} Months `;
      if (weeks > 0) countdownString += `${weeks} Weeks `;
      if (days > 0) countdownString += `${days} Days `;
      if (hours > 0) countdownString += `${hours} Hours `;
      if (minutes > 0) countdownString += `${minutes} Minutes `;
      if (seconds >= 0) countdownString += `${seconds} Seconds`;

      this.countdown = countdownString.trim();
    }, 1000);
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }


  addToCart() {
    console.log(`Added ${this.quantity} of ${this.raffle.title} to cart`);
    // Implement add to cart functionality
  }
}
