import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { catchError, throwError } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {
onSearch($event: Event) {
throw new Error('Method not implemented.');
}
  raffles: any[] = [];
  totalRaffles: number = 0;
  activeRaffles: number = 0;
  isLoading: boolean = true;
  errorMessage: string = '';

  @ViewChild('raffleChart') raffleChart!: ElementRef;
  @ViewChild('salesChart') salesChartCanvas!: ElementRef;

  chart: any;

  isSidebarOpen = true; // Sidebar is initially open

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.getRaffles();
  }

  // Toggle the sidebar visibility
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen; // Toggle the state
  }

  ionViewDidEnter() {
    this.getRaffles();
    setTimeout(() => {
      this.createChart(); // Create Raffle Chart
      this.createSalesChart(); // Create Sales Chart
    }, 500);
  }

  getRaffles() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getRecentRaffles().pipe(
      catchError((error) => {
        console.error('Error fetching raffles:', error);
        this.errorMessage = 'Failed to load raffles. Please try again.';
        this.isLoading = false;
        return throwError(error);
      })
    ).subscribe(
      (response) => {
        this.raffles = response.map((raffle: any) => {
          const progress = this.calculateProgress(raffle);
          console.log(`Raffle ID: ${raffle._id}, Progress: ${progress}`);
          return {
            ...raffle,
            progress,
          };
        });

        this.totalRaffles = this.raffles.length;

        // Log current time for debugging
        const now = Date.now();
        console.log(`Current Time: ${now} (${new Date(now).toISOString()})`);

        // Corrected logic for active raffles
        this.activeRaffles = this.raffles.filter(raffle => {
          const start = new Date(raffle.startDate).getTime();
          const end = new Date(raffle.endDate).getTime();

          // Log start and end dates for debugging
          console.log(`Raffle ID: ${raffle._id}`);
          console.log(`Start Date: ${raffle.startDate} (${start})`);
          console.log(`End Date: ${raffle.endDate} (${end})`);

          // Check if the raffle is active
          return now >= start && now <= end; // Raffle is active if now is between start and end
        }).length;

        console.log(`Total Raffles: ${this.totalRaffles}`);
        console.log(`Active Raffles: ${this.activeRaffles}`);
        console.log(`Inactive Raffles: ${this.totalRaffles - this.activeRaffles}`);

        this.isLoading = false;
        this.createChart();
      },
      (error) => {
        console.error('Error fetching raffles:', error);
        this.isLoading = false;
      }
    );
  }


  calculateProgress(raffle: any): number {
    if (!raffle.startDate || !raffle.endDate) return 0;

    const start = new Date(raffle.startDate).getTime();
    const end = new Date(raffle.endDate).getTime();
    const now = Date.now();

    // Log start and end dates for debugging
    console.log(`Raffle ID: ${raffle._id}`);
    console.log(`Start Date: ${raffle.startDate} (${start})`);
    console.log(`End Date: ${raffle.endDate} (${end})`);

    // Check for invalid date range
    if (start > end) {
      console.error(`Invalid date range for Raffle ID: ${raffle._id}. End date is before start date.`);
      return 0; // Treat as inactive
    }

    if (now > end) return 100; // Raffle has ended
    if (now < start) return 0; // Raffle hasn't started yet

    return ((now - start) / (end - start)) * 100; // Calculate progress
  }
  createChart() {
    if (this.chart) {
      this.chart.destroy(); // Destroy the previous chart if it exists
    }

    this.chart = new Chart(this.raffleChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Active Raffles', 'Inactive Raffles'],
        datasets: [
          {
            data: [this.activeRaffles, this.totalRaffles - this.activeRaffles],
            backgroundColor: ['#4CAF50', '#FF5733'],
            hoverBackgroundColor: ['#45A049', '#E74C3C'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
        },
      },
    });
  }

  createSalesChart() {
    const ctx = this.salesChartCanvas.nativeElement.getContext('2d');
    const salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [{
          label: 'Sales (Temp Money)',
          data: [10, 20, 30, 40, 50], // Placeholder data
          borderColor: 'rgba(0, 123, 255, 0.8)',
          fill: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,  // Disable aspect ratio maintenance for full container flexibility
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }


  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
    });
    await toast.present();
  }

  navigateToCreateRaffle() {
    this.router.navigate(['/create-raffle']);
    this.presentToast('Navigating to Create Raffle', 'success');
  }

  navigateToRaffleDetail(raffleId: number) {
    this.router.navigate([`/raffle-detail/${raffleId}`]);
    this.presentToast(`Opening raffle: ${raffleId}`, 'tertiary');
  }

  navigateToRaffleManagement() {
    this.router.navigate(['/raffle-management']);
    this.presentToast('Navigating to Raffle Management', 'primary');
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
    this.presentToast('You have been logged out', 'danger');
  }
}
