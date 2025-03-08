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

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.loadRaffles();
  }

  async loadRaffles() {
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

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  navigateToRaffleDetail(raffleId: string) {
    this.router.navigate([`/raffle-detail/${raffleId}`]);
  }
}
