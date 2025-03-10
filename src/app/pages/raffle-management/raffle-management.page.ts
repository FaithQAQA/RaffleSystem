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
onSearch($event: Event) {
throw new Error('Method not implemented.');
}

  raffles: any[] = [];
  filteredRaffles: any[] = [];
  searchTerm: string = '';
  selectedFilter: string = 'all';
  isSidebarOpen = true; // Sidebar is initially open

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadRaffles();
  }

  async loadRaffles() {
    const token = localStorage.getItem('adminToken');
    console.log('Stored Token:', token); // Check if the token is stored

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


  filterRaffles() {
    this.filteredRaffles = this.raffles.filter(raffle => {

      const matchesSearch = this.searchTerm
        ? raffle.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;

      const matchesFilter =
        this.selectedFilter === 'all' ||
        (this.selectedFilter === 'active' && raffle.status === 'active') ||
        (this.selectedFilter === 'completed' && raffle.status === 'completed');

      return matchesSearch && matchesFilter;
    });
  }

  navigateToCreateRaffle() {
    this.router.navigate(['/create-raffle']);
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
    //this.presentToast('You have been logged out', 'danger');
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  navigateToRaffleDetail(raffleId: number) {
    this.router.navigate([`/raffle-detail/${raffleId}`]);
  //  this.presentToast(`Opening raffle: ${raffleId}`, 'tertiary');
  }


  navigateToRaffleManagement() {
    this.router.navigate(['/raffle-management']);
   // this.presentToast('Navigating to Raffle Management', 'primary');
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen; // Toggle the state
  }

}
