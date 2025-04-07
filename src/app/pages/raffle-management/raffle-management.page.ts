import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-raffle-management',
  templateUrl: './raffle-management.page.html',
  styleUrls: ['./raffle-management.page.scss'],
  standalone: false,
})
export class RaffleManagementPage implements OnInit {
  raffles: any[] = [];
  filteredRaffles: any[] = [];
  searchTerm: string = '';
  selectedFilter: string = 'all';
  isSidebarOpen = true; // Sidebar is initially open

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadRaffles();
  }

  // Load raffles from the API
  async loadRaffles() {
    const token = localStorage.getItem('adminToken');
    console.log('Stored Token:', token);

    this.apiService.getAllRaffles().subscribe(
      (raffles: any[]) => {
        this.raffles = raffles;
        this.filterRaffles();
      },
      (error) => {
        console.error('Error loading raffles:', error);
      }
    );
  }

  // Filter raffles based on search term and selected filter
  filterRaffles() {
    this.filteredRaffles = this.raffles.filter((raffle) => {
      const matchesSearch = this.searchTerm
        ? (raffle.title || '')
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        : true;
      const matchesFilter =
        this.selectedFilter === 'all' ||
        (this.selectedFilter === 'active' && raffle.status === 'active') ||
        (this.selectedFilter === 'completed' && raffle.status === 'completed');

      return matchesSearch && matchesFilter;
    });
  }

  // Handle search input from ion-input
  onSearch(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterRaffles();
  }

  navigateToCreateRaffle() {
    this.router.navigate(['/create-raffle']);
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  navigateToRaffleDetail(raffleId: String) {
    this.router.navigate([`/raffle-detail/${raffleId}`]);
  }

  navigateToRaffleManagement() {
    this.router.navigate(['/raffle-management']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
