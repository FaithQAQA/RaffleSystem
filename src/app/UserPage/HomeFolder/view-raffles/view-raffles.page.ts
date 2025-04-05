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
  darkMode: any;
  raffles: any[] = []; // Stores all raffles
  filteredRaffles: any[] = []; // Stores filtered raffles based on search
  searchTerm: string = '';
  selectedFilter: string = 'all';
  hoverIndex: number = -1; // Used for showing Add to Cart button on hover
  categories: string[] = ['Electronics', 'Clothing', 'Home Appliances', 'Accessories']; // Example categories
  cartItemCount = 0;

  displayCount: number = 6; // Number of raffles to display initially
  incrementCount: number = 6; // Number of raffles to load when clicking "Load More"

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.cartCount$.subscribe((count) => {
      this.cartItemCount = count;
    });

    this.apiService.loadCart(); // Load cart initially
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
    const uniqueCategories = new Set(this.raffles.map((r) => r.category));
    this.categories = ['All', ...Array.from(uniqueCategories)];
  }

  loadMoreRaffles() {
    this.displayCount += this.incrementCount; // Increase display count
    this.filterRaffles();
  }

  // Filter raffles based on search term and selected filter
  filterRaffles() {
    let filtered = this.raffles.filter((raffle) => {
      const matchesSearch = this.searchTerm
        ? raffle.title.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;

      const matchesCategory =
        this.selectedFilter === 'all' || raffle.category === this.selectedFilter;

      return matchesSearch && matchesCategory;
    });

    this.filteredRaffles = filtered.slice(0, this.displayCount); // Only display a subset of raffles
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
  }

  addToCart(raffleId: string, event: Event) {
    event.stopPropagation(); // Prevent navigation when clicking the button
    console.log('Added to cart:', raffleId);
    this.apiService.addToCart(raffleId, 1);
    // Add your cart logic here
  }
}
