import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { ApiService, Order } from '../../services/api.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
  standalone: false
})
export class OrderDetailsPage implements OnInit {
  order: Order | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const orderId = params.get('id');
      if (orderId) {
        this.loadOrderDetails(orderId);
      } else {
        this.error = 'Order ID not found in URL';
        this.loading = false;
      }
    });
  }

  async loadOrderDetails(orderId: string) {
    const loading = await this.loadingController.create({
      message: 'Loading order details...',
    });
    await loading.present();

    try {
      this.apiService.getOrderDetails(orderId).subscribe({
        next: (order: Order) => {
          console.log('Order data received:', order);
          this.order = order;
          this.error = '';
        },
        error: (err: any) => {
          console.error('Error loading order:', err);
          this.error = err.error?.error || 'Failed to load order details';
          this.order = null;
        },
        complete: () => {
          this.loading = false;
          loading.dismiss();
        }
      });
    } catch (err: any) {
      console.error('Unexpected error:', err);
      this.error = 'An unexpected error occurred';
      this.order = null;
      this.loading = false;
      await loading.dismiss();
    }
  }

  // Safe methods that handle null/undefined orders and IDs
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Toronto'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  }

  getShortOrderId(orderId: any): string {
    // Handle various cases safely
    if (!orderId) return 'N/A';

    // If it's an object with _id property
    if (typeof orderId === 'object' && orderId._id) {
      return this.extractShortId(orderId._id);
    }

    // If it's a string
    if (typeof orderId === 'string') {
      return this.extractShortId(orderId);
    }

    // If it's an object with id property
    if (typeof orderId === 'object' && orderId.id) {
      return this.extractShortId(orderId.id);
    }

    console.warn('Unexpected orderId type:', typeof orderId, orderId);
    return 'N/A';
  }

  private extractShortId(id: string): string {
    if (!id || typeof id !== 'string') return 'N/A';

    // Handle MongoDB ObjectId - take last 8 characters
    if (id.length >= 8) {
      return id.slice(-8).toUpperCase();
    }

    // If shorter than 8 characters, use the whole ID
    return id.toUpperCase();
  }

  getStatusColor(status: string | undefined): string {
    if (!status) return 'medium';

    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'danger';
      default: return 'medium';
    }
  }

  browseMoreRaffles() {
    this.router.navigate(['/view-raffles']);
  }

  async contactSupport() {
    const alert = await this.alertController.create({
      header: 'Contact Support',
      message: 'Please contact our support team with your order number for assistance.',
      buttons: ['OK']
    });
    await alert.present();
  }

  refreshOrder() {
    if (this.order) {
      this.loadOrderDetails(this.order._id);
    }
  }

  goBack() {
    this.router.navigate(['/view-raffles']);
  }
}
