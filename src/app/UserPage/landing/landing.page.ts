import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { ToastController } from '@ionic/angular';

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
  cartItemCount = 0;
  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.apiService.cartCount$.subscribe(count => {
      this.cartItemCount = count;
    });
    this.apiService.loadCart(); // Load cart initially
    this.getRecentRaffles();

    // Initialize dark mode based on saved preference
    const darkModeSetting = localStorage.getItem('darkMode');
    if (darkModeSetting === 'enabled') {
      document.body.classList.add('dark-mode');
    }
  }

  toggleDarkMode()
  {
    this.router.navigate(['/view-history'])

  }

  getRecentRaffles() {
    this.isLoading = true;
    this.apiService.getRecentRaffles().pipe(
      catchError(error => {
        console.error('Error fetching recent raffles:', error);
        this.errorMessage = 'Failed to load recent raffles.';
        this.announce('Failed to load recent raffles.');
        return throwError(() => new Error(error));
      })
    ).subscribe(response => {
      this.recentRaffles = response
        .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 3);
      this.isLoading = false;
      this.announce('Recent raffles loaded successfully.');
            console.log(this.recentRaffles);

    });
  }



  goToRaffleDetail(raffleId: string) {
    if (!raffleId) {
      console.error('Error: Raffle ID is undefined or null');
      return;
    }
    this.router.navigate([`/view-products/${raffleId}`]);
  }



  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }

  private announce(message: string) {
    const liveRegion = document.getElementById('liveRegion');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
    this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    }).then(toast => toast.present());
  }
}
