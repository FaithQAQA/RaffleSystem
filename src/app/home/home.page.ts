import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { catchError, take } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';


 interface raffleData  {
  title: string;
  description: string
  _id: string
  raffleItems: [],
  participants: []
};


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {

  recentRaffles: raffleData[] = [];
  errorMessage: string = '';

  constructor(private apiService: ApiService, private router: Router,) {}

  ngOnInit() {
    this.getRandomRaffles();
  }

   toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
  }

  getRandomRaffles() {
    this.apiService.getRecentRaffles().pipe(
      take(1),
      catchError(error => {
        console.error('Error fetching raffles:', error);
        this.errorMessage = 'Failed to load raffles.';
        return throwError(() => new Error(error));
      })
    ).subscribe((response: raffleData[]) => {
      this.recentRaffles = response.length > 3
        ? response
            .map((raffle: raffleData) => ({ raffle, sort: Math.random() })) // Add random sort key
            .sort((a, b) => a.sort - b.sort) // Sort by random key
            .slice(0, 3) // Select 3 random raffles
            .map(({ raffle }) => raffle) // Extract Raffle objects
        : response; // If less than 3 raffles, return all
    });
  }
  getRandomIcon(): string {
  const icons = ['bi-gift', 'bi-stars', 'bi-fire', 'bi-snow2', 'bi-award', 'bi-lightning'];
  return icons[Math.floor(Math.random() * icons.length)];
}

getBadgeLabel(raffle: raffleData): string {
  const labels = ['New', 'Hot', 'Popular', 'Exclusive'];
  return labels[Math.floor(Math.random() * labels.length)];
}


  goToRaffleDetail(raffleId: string) {
    console.log('Navigating to raffle with ID:', raffleId);
    if (raffleId === undefined || raffleId === null) {
      console.error('Error: Raffle ID is undefined or null');
      return;
    }
    this.router.navigate([`/view-products/${raffleId}`]);
    //this.router.navigate([`/raffle-detail/${raffleId}`]);

  }

  navigateToLandingPage()
{
  this.router.navigate(['/landing']);

}
}
