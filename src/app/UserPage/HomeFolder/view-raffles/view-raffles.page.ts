import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-raffles',
  templateUrl: './view-raffles.page.html',
  styleUrls: ['./view-raffles.page.scss'],
  standalone: false,
})
export class ViewRafflesPage implements OnInit {

  raffles: any[] = []; // Stores all raffles
  filteredRaffles: any[] = []; // Stores filtered raffles based on search
  searchTerm: string = '';
  selectedFilter: string = 'all';
  hoverIndex: number = -1; // Used for showing Add to Cart button on hover
  selectedCategory: string = 'all';
  categories: string[] = ['Electronics', 'Clothing', 'Home Appliances', 'Accessories']; // Example categories
  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    this.loadRaffles();
  }

  async loadRaffles() {
    const token = localStorage.getItem('adminToken');
    console.log('Stored Token:', token); // Debugging token retrieval

    this.apiService.getAllRaffles().subscribe(
      (raffles: any[]) => {
        this.raffles = raffles;
        this.extractCategories(); // Get unique categories from raffles
        this.filterRaffles(); // Apply filtering after fetching data
      },
      (error) => {
        console.error('Error loading raffles:', error);
      }
    );
  }

  extractCategories() {
    const uniqueCategories = new Set(this.raffles.map(r => r.category));
    this.categories = ['All', ...Array.from(uniqueCategories)];
  }


  // Filter raffles based on search term and selected filter
  filterRaffles() {
    this.filteredRaffles = this.raffles.filter((raffle) => {
      const matchesSearch = this.searchTerm
        ? raffle.title.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;

      const matchesCategory = this.selectedFilter === 'all' || raffle.category === this.selectedFilter;

      return matchesSearch && matchesCategory;
    });
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }

  goToRaffleDetail(raffleId: string) {
    console.log('Navigating to raffle with ID:', raffleId);
    if (raffleId === undefined || raffleId === null) {
      console.error('Error: Raffle ID is undefined or null');
      return;
    }
    this.router.navigate([`/view-products/${raffleId}`]);
    //this.router.navigate([`/raffle-detail/${raffleId}`]);

  }



  addToCart(raffleId: number, event: Event) {
    event.stopPropagation(); // Prevent navigation when clicking the button
    console.log('Added to cart:', raffleId);
    // Add your cart logic here
  }
}
