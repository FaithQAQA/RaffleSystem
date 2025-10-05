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
  userMenuOpen: any;

  recentRaffles: any[] = [];
  allRaffles: any[] = [];
  totalRaffles: number = 0;
  activeRaffles: number = 0;
  upcomingRaffles: number = 0;
  completedRaffles: number = 0;

  isLoading: boolean = true;
  errorMessage: string = '';

  @ViewChild('raffleChart') raffleChart!: ElementRef;
  @ViewChild('salesChart') salesChartCanvas!: ElementRef;

  raffleChartInstance: any;
  salesChartInstance: any;

  isSidebarOpen = true;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.fetchDashboardData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createChart();
      this.createSalesChart();
    }, 500);
  }

  fetchDashboardData() {
    this.getRecentRaffles();
    this.getAllRafflesWithStatus();
  }

  getRecentRaffles() {
    this.isLoading = true;
    this.apiService.getRecentRaffles().pipe(
      catchError(error => {
        console.error('Error fetching recent raffles:', error);
        this.errorMessage = 'Failed to load recent raffles.';
        this.isLoading = false;
        return throwError(() => new Error(error));
      })
    ).subscribe(response => {
      this.recentRaffles = response
        .sort((a: { startDate: string }, b: { startDate: string }) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 3)
        .map((raffle: any) => ({ ...raffle, progress: this.calculateProgress(raffle) }));
      this.isLoading = false;
    });
  }

  getAllRafflesWithStatus() {
    this.apiService.getAllRaffles().subscribe(
      raffles => {
        this.allRaffles = raffles.map((raffle: { startDate: string; endDate: string }) => {
          const now = Date.now();
          const start = new Date(raffle.startDate).getTime();
          const end = new Date(raffle.endDate).getTime();
          let status = now < start ? 'Upcoming' : now <= end ? 'Active' : 'Completed';
          return { ...raffle, status };
        });

        this.totalRaffles = this.allRaffles.length;
        this.activeRaffles = this.allRaffles.filter(r => r.status === 'Active').length;
        this.upcomingRaffles = this.allRaffles.filter(r => r.status === 'Upcoming').length;
        this.completedRaffles = this.allRaffles.filter(r => r.status === 'Completed').length;

        this.loadAllRafflesForChart();
      },
      error => {
        console.error('Error fetching all raffles:', error);
        this.presentToast('Failed to fetch all raffles', 'danger');
      }
    );
  }

  calculateProgress(raffle: any): number {
    const start = new Date(raffle.startDate).getTime();
    const end = new Date(raffle.endDate).getTime();
    const now = Date.now();
    if (start > end || now < start) return 0;
    return now > end ? 100 : ((now - start) / (end - start)) * 100;
  }

  createChart() {
    if (!this.raffleChart?.nativeElement) return;
    if (this.raffleChartInstance) this.raffleChartInstance.destroy();

    this.raffleChartInstance = new Chart(this.raffleChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Active Raffles', 'Upcoming Raffles', 'Completed Raffles'],
        datasets: [{
          data: [this.activeRaffles, this.upcomingRaffles, this.completedRaffles],
          backgroundColor: ['#4CAF50', '#2196F3', '#FF5733'], // green, blue, red
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
  }

  createSalesChart() {
    if (!this.salesChartCanvas?.nativeElement) return;
    const ctx = this.salesChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.apiService.getMonthlySales().subscribe((data) => {
      const labels = data.map(d => `${d.year}-${String(d.month).padStart(2, '0')}`);
      const salesData = data.map(d => d.totalSales);

      if (this.salesChartInstance) this.salesChartInstance.destroy();

      this.salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Monthly Sales ($)',
            data: salesData,
            borderColor: 'rgba(0, 123, 255, 0.8)',
            backgroundColor: 'rgba(0, 123, 255, 0.3)',
            fill: true,
            tension: 0.3,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    });
  }

  loadAllRafflesForChart() {
    this.createChart(); // just use computed values
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({ message, duration: 2000, color });
    await toast.present();
  }

  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
    this.presentToast('You have been logged out', 'danger');
  }

  navigateToRaffleDetail(raffleId: number) {
    this.router.navigate([`/raffle-detail/${raffleId}`]);
    this.presentToast(`Opening raffle: ${raffleId}`, 'tertiary');
  }

  navigateToRaffleManagement() {
    this.router.navigate(['/raffle-management']);
    this.presentToast('Navigating to Raffle Management', 'primary');
  }

  navigateToCreateRaffle() {
    this.router.navigate(['/create-raffle']);
    this.presentToast('Navigating to Create Raffle', 'success');
  }

  exportCSV(raffleId: string) {
    this.apiService.exportRaffleToCSV(raffleId);
    this.presentToast('Exporting raffle data...', 'primary');
  }
}
