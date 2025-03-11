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
    console.log('Stored Token:', token); // Check if the token is stored

    this.apiService.getAllRaffles().subscribe(
      (raffles: any[]) => {
        this.raffles = raffles;
        this.filterRaffles(); // Filter the raffles after loading
      },
      (error) => {
        console.error('Error loading raffles:', error);
      }
    );
  }

  // Filter raffles based on search term and selected filter
  filterRaffles() {
    this.filteredRaffles = this.raffles.filter((raffle) => {
      // Filter by search term (case-insensitive)
      const matchesSearch = this.searchTerm
        ? (raffle.title || '')
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase())
        : true;

      // Filter by selected status
      const matchesFilter =
        this.selectedFilter === 'all' ||
        (this.selectedFilter === 'active' && raffle.status === 'active') ||
        (this.selectedFilter === 'completed' && raffle.status === 'completed');

      // Return true only if both filters match
      return matchesSearch && matchesFilter;
    });
  }

  // Handle search input
  onSearch(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value; // Update searchTerm with the user's input
    this.filterRaffles(); // Re-filter raffles based on updated searchTerm
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
    this.isSidebarOpen = !this.isSidebarOpen; // Toggle the state of the sidebar
  }
}
