import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { catchError, take } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';


 interface raffleData  {
  title: string; // Changed from 'name' to 'title' to match the backend structure
  description: string
  _id: string
  raffleItems: [], // Assuming an empty array for now
  participants: [] // Assuming an empty array for now
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
