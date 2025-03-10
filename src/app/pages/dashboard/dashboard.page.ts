import { Component, ElementRef, OnInit, AfterViewInit, ViewChild } from '@angular/core';
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
export class DashboardPage implements OnInit, AfterViewInit {
  raffles: any[] = [];
  totalRaffles: number = 0;
  activeRaffles: number = 0;
  isLoading: boolean = true;
  errorMessage: string = '';

  @ViewChild('raffleChart') raffleChart!: ElementRef;
  @ViewChild('salesChart') salesChartCanvas!: ElementRef;

  chart: any;

  isSidebarOpen = true;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.getRaffles();
  }

  onSearch($event: Event) {
    throw new Error('Method not implemented.');
    }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createChart();
      this.createSalesChart();
    }, 500);
  }

    // Toggle the sidebar visibility
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen; // Toggle the state
    }

  getRaffles() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getRecentRaffles().pipe(
      catchError((error) => {
        console.error('Error fetching raffles:', error);
        this.errorMessage = 'Failed to load raffles. Please try again.';
        this.isLoading = false;
        return throwError(() => new Error(error));
      })
    ).subscribe(
      (response) => {
        this.raffles = response.map((raffle: any) => {
          return { ...raffle, progress: this.calculateProgress(raffle) };
        });

        this.totalRaffles = this.raffles.length;
        const now = Date.now();

        this.activeRaffles = this.raffles.filter(raffle => {
          const start = new Date(raffle.startDate).getTime();
          const end = new Date(raffle.endDate).getTime();
          return now >= start && now <= end;
        }).length;

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

    if (start > end) return 0;
    if (now > end) return 100;
    if (now < start) return 0;

    return ((now - start) / (end - start)) * 100;
  }

  createChart() {
    if (!this.raffleChart || !this.raffleChart.nativeElement) {
      console.error('Chart element not found');
      return;
    }

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    this.chart = new Chart(this.raffleChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Active Raffles', 'Inactive Raffles'],
        datasets: [
          {
            data: [this.activeRaffles, this.totalRaffles - this.activeRaffles],
            backgroundColor: ['#4CAF50', '#FF5733'],
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
    if (!this.salesChartCanvas || !this.salesChartCanvas.nativeElement) {
      console.error("Sales chart canvas not found.");
      return;
    }

    const ctx = this.salesChartCanvas.nativeElement.getContext('2d');
    if (!ctx) {
      console.error("Canvas context not available for Sales Chart.");
      return;
    }

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [{
          label: 'Sales (Temp Money)',
          data: [10, 20, 30, 40, 50],
          borderColor: 'rgba(0, 123, 255, 0.8)',
          fill: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
