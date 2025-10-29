import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
  standalone: false,
})
export class LandingPage implements OnInit {
  recentRaffles: any[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  cartItemCount = 0;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.apiService.cartCount$.subscribe(count => {
      this.cartItemCount = count;
    });
    this.apiService.loadCart();
    this.getRecentRaffles();
  }

  // ============ DATA HANDLING METHODS ============

  getRecentRaffles() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getRecentRaffles().pipe(
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
      if (Array.isArray(response)) {
        this.recentRaffles = this.processRafflesData(response);
      } else if (response && Array.isArray(response.raffles)) {
        this.recentRaffles = this.processRafflesData(response.raffles);
      } else if (response && Array.isArray(response.data)) {
        this.recentRaffles = this.processRafflesData(response.data);
      } else {
        console.warn('Unexpected response format:', response);
        this.recentRaffles = [];
      }

      this.isLoading = false;
      console.log('Processed raffles:', this.recentRaffles);
    });
  }

  private processRafflesData(raffles: any[]): any[] {
    if (!Array.isArray(raffles)) return [];

    return raffles
      .map(raffle => this.normalizeRaffleData(raffle))
      .filter(raffle => raffle !== null)
      .sort((a, b) => {
        // Sort by end date (soonest first) or by creation date
        const dateA = a.endDate ? new Date(a.endDate).getTime() : new Date(a.createdAt).getTime();
        const dateB = b.endDate ? new Date(b.endDate).getTime() : new Date(b.createdAt).getTime();
        return dateA - dateB;
      })
      .slice(0, 6); // Limit to 6 raffles
  }

  private normalizeRaffleData(raffle: any): any {
    if (!raffle) return null;

    try {
      return {
        _id: raffle._id || raffle.id || '',
        title: raffle.title || 'Untitled Raffle',
        description: raffle.description || 'No description available',
        price: this.safeNumber(raffle.price, 0),
        ticketsSold: this.safeNumber(raffle.ticketsSold, 0),
        totalTickets: this.safeNumber(raffle.totalTickets, 100),
        startDate: raffle.startDate || raffle.createdAt || new Date().toISOString(),
        endDate: raffle.endDate || this.calculateEndDate(raffle.createdAt),
        image: raffle.image || raffle.imageUrl || null,
        status: raffle.status || 'active',
        createdAt: raffle.createdAt || new Date().toISOString(),
        updatedAt: raffle.updatedAt || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error normalizing raffle data:', error, raffle);
      return null;
    }
  }

  private safeNumber(value: any, defaultValue: number): number {
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

  // ============ UI HELPER METHODS ============

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
    return this.safeNumber(raffle.price, 0);
  }

  getRaffleDateInfo(raffle: any): string {
    if (raffle.startDate) {
      const startDate = new Date(raffle.startDate);
      return `Started ${this.formatDate(startDate)}`;
    }
    return 'Starting soon';
  }

  // ============ CALCULATION METHODS ============

  getTotalTicketsSold(): number {
    return this.recentRaffles.reduce((total, raffle) => total + this.getTicketsSold(raffle), 0);
  }

  getEndingSoonCount(): number {
    return this.recentRaffles.filter(raffle => this.isEndingSoon(raffle)).length;
  }

  getTicketsSold(raffle: any): number {
    return this.safeNumber(raffle.ticketsSold, 0);
  }

  getTotalTickets(raffle: any): number {
    return this.safeNumber(raffle.totalTickets, 100);
  }

  getRemainingTickets(raffle: any): number {
    return Math.max(0, this.getTotalTickets(raffle) - this.getTicketsSold(raffle));
  }

  calculateProgress(raffle: any): number {
    const total = this.getTotalTickets(raffle);
    const sold = this.getTicketsSold(raffle);
    if (total === 0) return 0;
    return Math.round((sold / total) * 100);
  }

  getProgressValue(raffle: any): number {
    const total = this.getTotalTickets(raffle);
    const sold = this.getTicketsSold(raffle);
    if (total === 0) return 0;
    return sold / total;
  }

  getProgressColor(raffle: any): string {
    const progress = this.calculateProgress(raffle);
    if (progress >= 80) return 'danger';
    if (progress >= 50) return 'warning';
    return 'primary';
  }

  // ============ STATUS METHODS ============

  isEndingSoon(raffle: any): boolean {
    if (!raffle.endDate) return false;
    const endDate = new Date(raffle.endDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  }

  getDaysUntilEnd(raffle: any): number {
    if (!raffle.endDate) return 0;
    const endDate = new Date(raffle.endDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isNewRaffle(raffle: any): boolean {
    if (!raffle.createdAt) return false;
    const createdDate = new Date(raffle.createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return createdDate > oneWeekAgo;
  }

  isSoldOut(raffle: any): boolean {
    return this.getRemainingTickets(raffle) <= 0;
  }

  isPopularRaffle(raffle: any): boolean {
    return this.calculateProgress(raffle) > 70 && !this.isSoldOut(raffle);
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
    // You can implement navigation to about page or show modal
  }

  // ============ UTILITY METHODS ============

  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  }

  private announce(message: string) {
    const liveRegion = document.getElementById('liveRegion');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
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
}
