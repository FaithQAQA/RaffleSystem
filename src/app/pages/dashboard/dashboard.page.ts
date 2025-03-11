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
onSearch($event: Event) {
throw new Error('Method not implemented.');
}
  recentRaffles: any[] = [];
  allRaffles: any[] = [];
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
        .sort((a: { startDate: string | number | Date; }, b: { startDate: string | number | Date; }) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 3)
        .map((raffle: any) => ({ ...raffle, progress: this.calculateProgress(raffle) }));
      this.isLoading = false;
    });
  }

  getAllRafflesWithStatus() {
    this.apiService.getAllRaffles().subscribe(
      raffles => {
        this.allRaffles = raffles.map((raffle: { startDate: string | number | Date; endDate: string | number | Date; }) => {
          const now = Date.now();
          const start = new Date(raffle.startDate).getTime();
          const end = new Date(raffle.endDate).getTime();
          let status = now < start ? 'Upcoming' : now <= end ? 'Active' : 'Completed';
          return { ...raffle, status };
        });
        this.totalRaffles = this.allRaffles.length;
        this.activeRaffles = this.allRaffles.filter(r => r.status === 'Active').length;
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
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.raffleChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Active Raffles', 'Inactive Raffles'],
        datasets: [{
          data: [this.activeRaffles, this.totalRaffles - this.activeRaffles],
          backgroundColor: ['#4CAF50', '#FF5733'],
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
  }

  createSalesChart() {
    if (!this.salesChartCanvas?.nativeElement) return;
    const ctx = this.salesChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

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
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
  }

  loadAllRafflesForChart() {
    this.apiService.getAllRaffles().subscribe(
      allRaffles => this.updateChartWithAllRaffles(allRaffles),
      error => console.error('Error fetching all raffles:', error)
    );
  }

  updateChartWithAllRaffles(allRaffles: any[]) {
    if (!this.raffleChart?.nativeElement) return;
    if (this.chart) this.chart.destroy();

    const activeAllRaffles = allRaffles.filter(r => {
      const start = new Date(r.startDate).getTime();
      const end = new Date(r.endDate).getTime();
      return Date.now() >= start && Date.now() <= end;
    }).length;

    this.chart = new Chart(this.raffleChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Active Raffles (All)', 'Inactive Raffles (All)'],
        datasets: [{
          data: [activeAllRaffles, allRaffles.length - activeAllRaffles],
          backgroundColor: ['#4CAF50', '#FF5733'],
        }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
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
   // this.router.navigate([/raffle-detail/${raffleId}]);
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

}
