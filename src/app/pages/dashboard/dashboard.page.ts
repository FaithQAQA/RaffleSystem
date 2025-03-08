import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {

  raffles: any[] = [];

  constructor(private apiService: ApiService, private router: Router) {}

  ionViewDidEnter() {
    this.getRaffles();
  }

  getRaffles() {
    this.apiService.getRecentRaffles().pipe(
      catchError((error) => {
        console.error('Error fetching raffles:', error);
        return throwError(error);  
      })
    ).subscribe(
      (response) => {
        this.raffles = response;
      },
      (error) => {
        console.error('Error fetching raffles:', error);
      }
    );
  }

  navigateToCreateRaffle() {
    this.router.navigate(['/create-raffle']);
  }

  navigateToRaffleDetail(raffleId: string) {
    this.router.navigate([`/raffle-detail/${raffleId}`]);
  }

  navigateToRaffleManagement() {
    this.router.navigate(['/raffle-management']);
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }

  ngOnInit() {
  }

}
