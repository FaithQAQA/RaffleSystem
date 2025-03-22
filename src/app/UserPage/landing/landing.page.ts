import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs/internal/observable/throwError';
import { catchError } from 'rxjs/internal/operators/catchError';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: false,

})
export class LandingPage implements OnInit {

  recentRaffles: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';


  constructor(private router: Router, private apiService: ApiService ) { }

  ngOnInit()
  {
    this.getRecentRaffles()
  }


    getRecentRaffles() {
      this.isLoading = true;
      this.apiService.getRecentRaffles().pipe(
        catchError(error => {
          console.error('Error fetching recent raffles:', error);
          this.errorMessage = 'Failed to load recent raffles.';
          return throwError(() => new Error(error));
        })
      ).subscribe(response => {
        this.recentRaffles = response
          .sort((a: { startDate: string | number | Date; }, b: { startDate: string | number | Date; }) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, 3)
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

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);

  }

}
