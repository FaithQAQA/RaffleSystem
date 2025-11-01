import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { throwError, Subject } from 'rxjs';
import { catchError, takeUntil, debounceTime } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush // Add this for performance
})
export class LandingPage implements OnInit, OnDestroy {
  recentRaffles: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  cartItemCount = 0;

  // Add destruction subject for memory leak prevention
  private destroy$ = new Subject<void>();
  private readonly CACHE_KEY = 'landing-recent-raffles';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Optimized subscription with debouncing and memory leak prevention
    this.apiService.cartCount$
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(50) // Reduce rapid updates
      )
      .subscribe(count => {
        this.cartItemCount = count;
      });

    this.apiService.loadCart();
    this.getRecentRaffles();
  }

  ngOnDestroy() {
    // Prevent memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============ OPTIMIZED DATA HANDLING METHODS ============

  getRecentRaffles() {
    // Check cache first to avoid unnecessary API calls
    const cached = this.getFromCache();
    if (cached && !this.isCacheExpired(cached)) {
      this.recentRaffles = cached.data;
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getRecentRaffles().pipe(
      takeUntil(this.destroy$), // Prevent memory leaks
      catchError(error => {
        console.error('Error fetching recent raffles:', error);
        this.errorMessage = this.getErrorMessage(error);
        this.announce('Failed to load recent raffles.');
        this.isLoading = false;
        return throwError(() => new Error(error));
      })
    ).subscribe(response => {
      console.log('Raw API response:', response);

      // Handle different response formats
      let processedRaffles: any[] = [];

      if (Array.isArray(response)) {
        processedRaffles = this.processRafflesData(response);
      } else if (response && Array.isArray(response.raffles)) {
        processedRaffles = this.processRafflesData(response.raffles);
      } else if (response && Array.isArray(response.data)) {
        processedRaffles = this.processRafflesData(response.data);
      } else {
        console.warn('Unexpected response format:', response);
        processedRaffles = [];
      }

      // Cache the processed data
      this.setCache(processedRaffles);
      this.recentRaffles = processedRaffles;
      this.isLoading = false;

      console.log('Processed raffles:', this.recentRaffles);
    });
  }

  // Simple caching mechanism for this component
  private getFromCache(): { data: any[], timestamp: number } | null {
    const cached = localStorage.getItem(this.CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.warn('Failed to parse cache:', e);
        localStorage.removeItem(this.CACHE_KEY);
      }
    }
    return null;
  }

  private setCache(data: any[]): void {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Failed to cache data:', e);
    }
  }

  private isCacheExpired(cached: { timestamp: number }): boolean {
    return Date.now() - cached.timestamp > 5 * 60 * 1000; // 5 minutes cache
  }

  private processRafflesData(raffles: any[]): any[] {
    if (!Array.isArray(raffles)) return [];

    // Use more efficient processing
    return raffles
      .map(raffle => this.normalizeRaffleData(raffle))
      .filter(raffle => raffle !== null)
      .sort((a, b) => {
        // Optimized date comparison - cache date values
        const dateA = a._endDate || (a.endDate ? new Date(a.endDate).getTime() : new Date(a.createdAt).getTime());
        const dateB = b._endDate || (b.endDate ? new Date(b.endDate).getTime() : new Date(b.createdAt).getTime());
        return dateA - dateB;
      })
      .slice(0, 6); // Limit to 6 raffles
  }

  private normalizeRaffleData(raffle: any): any {
    if (!raffle) return null;

    try {
      // Pre-calculate expensive values
      const price = this.safeNumber(raffle.price, 0);
      const ticketsSold = this.safeNumber(raffle.ticketsSold, 0);
      const totalTickets = this.safeNumber(raffle.totalTickets, 100);
      const endDate = raffle.endDate || this.calculateEndDate(raffle.createdAt);

      const normalized = {
        _id: raffle._id || raffle.id || '',
        title: raffle.title || 'Untitled Raffle',
        description: raffle.description || 'No description available',
        price: price,
        ticketsSold: ticketsSold,
        totalTickets: totalTickets,
        startDate: raffle.startDate || raffle.createdAt || new Date().toISOString(),
        endDate: endDate,
        image: raffle.image || raffle.imageUrl || null,
        status: raffle.status || 'active',
        createdAt: raffle.createdAt || new Date().toISOString(),
        updatedAt: raffle.updatedAt || new Date().toISOString(),
        // Pre-calculated values for performance
        _endDate: new Date(endDate).getTime(),
        _remainingTickets: Math.max(0, totalTickets - ticketsSold),
        _progress: totalTickets === 0 ? 0 : Math.round((ticketsSold / totalTickets) * 100)
      };

      return normalized;
    } catch (error) {
      console.error('Error normalizing raffle data:', error, raffle);
      return null;
    }
  }

  private safeNumber(value: any, defaultValue: number): number {
    if (typeof value === 'number') return value;
    const num = Number(value);
    return isNaN(num) ? defaultValue : Math.max(0, num);
  }

  private calculateEndDate(createdAt: string): string {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 30); // Default 30 days from creation
    return date.toISOString();
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
    return 'Failed to load recent raffles. Please try again.';
  }

  // ============ OPTIMIZED UI HELPER METHODS ============

  getRaffleAriaLabel(raffle: any): string {
    return `Raffle: ${raffle.title}. ${raffle.description}. Price: $${raffle.price} per ticket. ${this.isEndingSoon(raffle) ? 'Ending soon!' : ''} ${this.isSoldOut(raffle) ? 'Sold out.' : ''}`;
  }

  getRaffleImage(raffle: any): string {
    return raffle.image || 'https://media.istockphoto.com/id/1750326573/vector/raffle-icon-choosing-random-numbered-ticket-prize-giveaway.jpg?s=612x612&w=0&k=20&c=JJw2CNLGniwQj6UoA-68oMS7oIAclLc3cJ3wp-2GSJ8=';
  }

  handleImageError(event: any) {
    event.target.src = 'https://media.istockphoto.com/id/1750326573/vector/raffle-icon-choosing-random-numbered-ticket-prize-giveaway.jpg?s=612x612&w=0&k=20&c=JJw2CNLGniwQj6UoA-68oMS7oIAclLc3cJ3wp-2GSJ8=';
  }

  getRaffleDescription(raffle: any): string {
    const desc = raffle.description || 'No description available';
    return desc.length > 120 ? desc.substring(0, 120) + '...' : desc;
  }

  getRafflePrice(raffle: any): number {
    return raffle.price; // Already normalized
  }

  getRaffleDateInfo(raffle: any): string {
    if (raffle.startDate) {
      const startDate = new Date(raffle.startDate);
      return `Started ${this.formatDate(startDate)}`;
    }
    return 'Starting soon';
  }

  // ============ OPTIMIZED CALCULATION METHODS ============

  getTotalTicketsSold(): number {
    // Use pre-calculated values for better performance
    return this.recentRaffles.reduce((total, raffle) => total + raffle.ticketsSold, 0);
  }

  getEndingSoonCount(): number {
    return this.recentRaffles.filter(raffle => this.isEndingSoon(raffle)).length;
  }

  getTicketsSold(raffle: any): number {
    return raffle.ticketsSold; // Already normalized
  }

  getTotalTickets(raffle: any): number {
    return raffle.totalTickets; // Already normalized
  }

  getRemainingTickets(raffle: any): number {
    return raffle._remainingTickets; // Use pre-calculated value
  }

  calculateProgress(raffle: any): number {
    return raffle._progress; // Use pre-calculated value
  }

  getProgressValue(raffle: any): number {
    return raffle._progress / 100; // Use pre-calculated value
  }

  getProgressColor(raffle: any): string {
    const progress = raffle._progress; // Use pre-calculated value
    if (progress >= 80) return 'danger';
    if (progress >= 50) return 'warning';
    return 'primary';
  }

  // ============ OPTIMIZED STATUS METHODS ============

  isEndingSoon(raffle: any): boolean {
    if (!raffle.endDate) return false;
    const now = Date.now();
    const endTime = raffle._endDate; // Use pre-calculated value
    const diffTime = endTime - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  }

  getDaysUntilEnd(raffle: any): number {
    if (!raffle.endDate) return 0;
    const now = Date.now();
    const endTime = raffle._endDate; // Use pre-calculated value
    const diffTime = endTime - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isNewRaffle(raffle: any): boolean {
    if (!raffle.createdAt) return false;
    const createdDate = new Date(raffle.createdAt).getTime();
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return createdDate > oneWeekAgo;
  }

  isSoldOut(raffle: any): boolean {
    return raffle._remainingTickets <= 0; // Use pre-calculated value
  }

  isPopularRaffle(raffle: any): boolean {
    return raffle._progress > 70 && !this.isSoldOut(raffle); // Use pre-calculated value
  }

  // ============ ACTION METHODS ============

  handleRaffleAction(raffle: any) {
    if (this.isSoldOut(raffle)) {
      this.announce('This raffle is sold out.');
      return;
    }
    this.addToCart(raffle);
  }

  addToCart(raffle: any) {
    if (!raffle._id) {
      this.announce('Cannot add raffle to cart: Invalid raffle ID');
      return;
    }

    this.apiService.addToCart(raffle._id, 1);
    this.announce(`Added ${raffle.title} to cart`);
  }

  goToRaffleDetail(raffleId: string) {
    if (!raffleId) {
      console.error('Error: Raffle ID is undefined or null');
      this.announce('Cannot view raffle details: Invalid raffle ID');
      return;
    }
    this.router.navigate([`/view-products/${raffleId}`]);
  }

  toggleDarkMode() {
    this.router.navigate(['/view-history']);
  }

  learnMore() {
    this.announce('Learn more about our mission and how you can help.');
  }

  // ============ OPTIMIZED UTILITY METHODS ============

  formatDate(date: Date): string {
    const now = Date.now();
    const diffTime = Math.abs(now - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }

  private async announce(message: string) {
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      const liveRegion = document.getElementById('liveRegion');
      if (liveRegion) {
        liveRegion.textContent = message;
      }
    });

    this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    }).then(toast => toast.present());
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }
  // Add this method for better *ngFor performance
trackByRaffleId(index: number, raffle: any): string {
  return raffle._id || index;
}

  // Add refresh method with cache busting
  refreshRaffles() {
    localStorage.removeItem(this.CACHE_KEY); // Clear cache
    this.getRecentRaffles();
  }
}
