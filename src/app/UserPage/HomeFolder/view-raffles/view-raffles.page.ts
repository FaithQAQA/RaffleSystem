import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

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
  selectedStatus: string = 'all';
  categories: string[] = ['All']; // Start with 'All' option
  cartItemCount = 0;
  sortBy: string = 'newest';

  displayCount: number = 6;
  incrementCount: number = 6;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.apiService.cartCount$.subscribe((count) => {
      this.cartItemCount = count;
    });

    this.apiService.loadCart(); // Load cart initially
    this.loadRaffles();
  }

  async loadRaffles() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getAllRaffles().subscribe(
      (response: any) => {
        console.log('Raw API response:', response);

        // Handle different response formats
        if (Array.isArray(response)) {
          this.raffles = this.processRafflesData(response);
        } else if (response && Array.isArray(response.raffles)) {
          this.raffles = this.processRafflesData(response.raffles);
        } else if (response && Array.isArray(response.data)) {
          this.raffles = this.processRafflesData(response.data);
        } else {
          console.warn('Unexpected response format:', response);
          this.raffles = [];
        }

        this.extractCategories();
        this.sortRaffles();
        this.filterRaffles();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading raffles:', error);
        this.errorMessage = this.getErrorMessage(error);
        this.isLoading = false;
        this.announce('Failed to load raffles. Please try again.');
      }
    );
  }

  private processRafflesData(raffles: any[]): any[] {
    if (!Array.isArray(raffles)) return [];

    return raffles
      .map(raffle => this.normalizeRaffleData(raffle))
      .filter(raffle => raffle !== null);
  }

  private normalizeRaffleData(raffle: any): any {
    if (!raffle) return null;

    try {
      return {
        _id: raffle._id || raffle.id || this.generateTempId(),
        title: raffle.title || 'Untitled Raffle',
        description: raffle.description || 'No description available',
        price: this.safeNumber(raffle.price, 0),
        ticketsSold: this.safeNumber(raffle.ticketsSold, 0),
        totalTickets: this.safeNumber(raffle.totalTickets, 100),
        startDate: raffle.startDate || raffle.createdAt || new Date().toISOString(),
        endDate: raffle.endDate || this.calculateEndDate(raffle.createdAt),
        image: raffle.image || raffle.imageUrl || null,
        status: raffle.status || this.determineStatus(raffle),
        category: raffle.category || 'General',
        createdAt: raffle.createdAt || new Date().toISOString(),
        updatedAt: raffle.updatedAt || new Date().toISOString(),
        endsInDays: this.calculateDaysUntilEnd(raffle.endDate || this.calculateEndDate(raffle.createdAt))
      };
    } catch (error) {
      console.error('Error normalizing raffle data:', error, raffle);
      return null;
    }
  }

  private generateTempId(): string {
    return 'temp_' + Math.random().toString(36).substr(2, 9);
  }

  private safeNumber(value: any, defaultValue: number): number {
    if (value === null || value === undefined) return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : Math.max(0, num);
  }

  private calculateEndDate(createdAt: string): string {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 30); // Default 30 days from creation
    return date.toISOString();
  }

  private calculateDaysUntilEnd(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private determineStatus(raffle: any): string {
    if (raffle.status) return raffle.status;

    const now = new Date();
    const startDate = new Date(raffle.startDate || raffle.createdAt);
    const endDate = new Date(raffle.endDate || this.calculateEndDate(raffle.createdAt));

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'completed';
    return 'active';
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.status === 0) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    if (error?.status === 401) {
      return 'Please log in to view raffles.';
    }
    if (error?.status === 404) {
      return 'No raffles found.';
    }
    return 'Failed to load raffles. Please try again.';
  }

  extractCategories() {
    const uniqueCategories = new Set(
      this.raffles
        .map((r) => r.category)
        .filter(category => category && category !== 'All')
    );
    this.categories = ['All', ...Array.from(uniqueCategories)];
  }

  loadMoreRaffles() {
    this.displayCount += this.incrementCount;
    this.filterRaffles();
  }

  // Filter raffles based on search term and selected filter
  filterRaffles() {
    let filtered = this.raffles.filter((raffle) => {
      const title = raffle?.title ?? '';
      const description = raffle?.description ?? '';
      const category = raffle?.category ?? '';
      const status = raffle?.status ?? 'completed';

      const matchesSearch = this.searchTerm
        ? title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          description.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;

      const matchesCategory =
        this.selectedFilter === 'all' || category === this.selectedFilter;

      const matchesStatus =
        this.selectedStatus === 'all' || status === this.selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    this.filteredRaffles = filtered.slice(0, this.displayCount);
  }

  // Sort raffles based on selected criteria
  sortRaffles() {
    switch (this.sortBy) {
      case 'newest':
        this.raffles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        this.raffles.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-low':
        this.raffles.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.raffles.sort((a, b) => b.price - a.price);
        break;
      case 'ending':
        this.raffles.sort((a, b) => {
          const aDays = this.calculateDaysUntilEnd(a.endDate);
          const bDays = this.calculateDaysUntilEnd(b.endDate);
          return aDays - bDays;
        });
        break;
    }
    this.filterRaffles();
  }

  toggleDarkMode() {
    this.router.navigate(['/view-history']);
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }

  goToRaffleDetail(raffleId: string) {
    console.log('Navigating to raffle with ID:', raffleId);
    if (!raffleId || raffleId.startsWith('temp_')) {
      console.error('Error: Invalid raffle ID');
      this.announce('Cannot view raffle details: Invalid raffle ID');
      return;
    }
    this.router.navigate([`/view-products/${raffleId}`]);
  }

  addToCart(raffleId: string, quantity: number = 1) {
    if (!raffleId || raffleId.startsWith('temp_')) {
      console.error('Error: Invalid raffle ID for cart');
      this.announce('Cannot add to cart: Invalid raffle ID');
      return;
    }

    const raffle = this.raffles.find(r => r._id === raffleId);
    if (raffle && raffle.status !== 'active') {
      this.announce('This raffle is not active and cannot be added to cart');
      return;
    }

    this.apiService.addToCart(raffleId, quantity);
    this.announce('Added to cart successfully');
  }

  // Status helpers
  getStatusIcon(status: string): string {
    switch (status) {
      case 'active': return 'play-circle-outline';
      case 'upcoming': return 'time-outline';
      case 'completed': return 'checkmark-circle-outline';
      default: return 'help-circle-outline';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'upcoming': return 'warning';
      case 'completed': return 'medium';
      default: return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active': return 'Active';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  }

  getActionIcon(status: string): string {
    return status === 'active' ? 'cart-outline' : 'eye-outline';
  }

  getActionText(status: string): string {
    switch (status) {
      case 'active': return 'Add to Cart';
      case 'upcoming': return 'View Details';
      case 'completed': return 'View Results';
      default: return 'View Details';
    }
  }

  // Data helpers
  getShortDescription(description: string): string {
    if (!description) return 'No description available';
    return description.length > 100 ? description.substring(0, 100) + '...' : description;
  }

  calculateProgress(raffle: any): number {
    if (!raffle.totalTickets || raffle.totalTickets === 0) return 0;
    return Math.round((raffle.ticketsSold / raffle.totalTickets) * 100);
  }

  getProgressColor(raffle: any): string {
    const progress = this.calculateProgress(raffle);
    if (progress >= 80) return 'danger';
    if (progress >= 50) return 'warning';
    return 'success';
  }

  // Filter helpers
  getActiveRafflesCount(): number {
    return this.raffles.filter(r => r.status === 'active').length;
  }

  getEndingSoonCount(): number {
    return this.raffles.filter(r => this.isEndingSoon(r)).length;
  }

  isEndingSoon(raffle: any): boolean {
    return raffle.endsInDays <= 3 && raffle.endsInDays > 0;
  }

  isNewRaffle(raffle: any): boolean {
    if (!raffle.createdAt) return false;
    const createdDate = new Date(raffle.createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return createdDate > oneWeekAgo;
  }

  isPopular(raffle: any): boolean {
    return this.calculateProgress(raffle) > 70 && raffle.status === 'active';
  }

  // Image handling
  getRaffleImage(raffle: any): string {
    if (raffle.image) return raffle.image;

    const placeholderText = encodeURIComponent(raffle.title || 'Raffle');
    return `https://placehold.co/600x400/667eea/ffffff?text=${placeholderText}`;
  }

  handleImageError(event: any) {
    const target = event.target;
    const altText = target.getAttribute('alt') || 'Raffle';
    const encodedText = encodeURIComponent(altText);
    target.src = `https://placehold.co/600x400/667eea/ffffff?text=${encodedText}`;
  }

  // Action handlers
  handleRaffleAction(raffle: any, event: Event) {
    event.stopPropagation();

    if (raffle.status === 'active') {
      this.addToCart(raffle._id, 1);
    } else {
      this.goToRaffleDetail(raffle._id);
    }
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedFilter = 'all';
    this.selectedStatus = 'all';
    this.sortBy = 'newest';
    this.displayCount = 6;
    this.sortRaffles();
    this.announce('Filters cleared');
  }

  subscribeNotifications() {
    this.announce('You will be notified when new raffles are available');
    // Implement actual notification logic here
  }

  private async announce(message: string) {
    const liveRegion = document.getElementById('liveRegion');
    if (liveRegion) {
      liveRegion.textContent = message;
    }

    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
