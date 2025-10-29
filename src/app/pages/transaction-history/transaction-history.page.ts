import { Component, OnInit } from '@angular/core';
import { ApiService, Order, MonthlySales, RaffleSales, DailySales, SalesStatistics } from '../../services/api.service';

// Define the view types as a type
type ViewType = 'user-orders' | 'monthly-sales' | 'raffle-sales' | 'daily-sales' | 'statistics' | 'pending-receipts';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.page.html',
  styleUrls: ['./transaction-history.page.scss'],
  standalone: false
})
export class TransactionHistoryPage implements OnInit {
  // Data arrays
  userOrders: Order[] = [];
  monthlySales: MonthlySales[] = [];
  raffleSales: RaffleSales[] = [];
  dailySales: DailySales[] = [];
  salesStats: SalesStatistics | null = null;
  pendingReceipts: Order[] = [];

  // Loading states
  isLoading = false;
  isAdmin = false;

  // Filter options
  selectedView: ViewType = 'user-orders';
  dateRange = {
    startDate: '',
    endDate: ''
  };
  selectedYear = new Date().getFullYear();

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalOrders = 0;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.checkUserRole();
    this.loadInitialData();
  }

  // Check if user is admin
  checkUserRole() {
    this.apiService.getCurrentUserProfile().subscribe({
      next: (user) => {
        this.isAdmin = user.isAdmin || false;
        if (this.isAdmin) {
          this.selectedView = 'monthly-sales';
        }
      },
      error: (error) => {
        console.error('Error checking user role:', error);
      }
    });
  }

  // Load initial data based on user role
  loadInitialData() {
    if (this.isAdmin) {
      this.loadMonthlySales();
      this.loadSalesStatistics();
    } else {
      this.loadUserOrders();
    }
  }

  // ============ VIEW MANAGEMENT METHODS ============

  changeView(view: any) {
    // Safely handle the view change with type checking
    const validView = this.isValidViewType(view) ? view : 'user-orders';
    this.selectedView = validView;
    this.loadViewData();
  }

  // Type guard to check if the value is a valid ViewType
  private isValidViewType(view: any): view is ViewType {
    const validViews: ViewType[] = [
      'user-orders',
      'monthly-sales',
      'raffle-sales',
      'daily-sales',
      'statistics',
      'pending-receipts'
    ];
    return validViews.includes(view);
  }

  loadViewData() {
    switch (this.selectedView) {
      case 'user-orders':
        this.loadUserOrders();
        break;
      case 'monthly-sales':
        this.loadMonthlySales();
        break;
      case 'raffle-sales':
        this.loadSalesByRaffle();
        break;
      case 'daily-sales':
        this.loadDailySales();
        break;
      case 'statistics':
        this.loadSalesStatistics();
        break;
      case 'pending-receipts':
        this.loadPendingReceipts();
        break;
      default:
        this.loadUserOrders(); // Fallback
        break;
    }
  }

  // ============ USER ORDER METHODS ============

  loadUserOrders() {
    this.isLoading = true;
    this.apiService.getUserOrders().subscribe({
      next: (orders) => {
        this.userOrders = orders;
        this.isLoading = false;
        console.log('Loaded user orders:', orders.length);
      },
      error: (error) => {
        console.error('Error loading user orders:', error);
        this.isLoading = false;
      }
    });
  }

  getOrderTotal(order: Order): number {
    return order.amount || 0;
  }

  getTaxAmount(order: Order): number {
    return order.taxAmount || 0;
  }

  getBaseAmount(order: Order): number {
    return order.baseAmount || order.amount - (order.taxAmount || 0);
  }

  // ============ ADMIN ANALYTICS METHODS ============

  loadMonthlySales() {
    this.isLoading = true;
    this.apiService.getMonthlySales(this.selectedYear).subscribe({
      next: (sales) => {
        this.monthlySales = sales;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading monthly sales:', error);
        this.isLoading = false;
      }
    });
  }

  loadSalesByRaffle() {
    this.isLoading = true;
    this.apiService.getSalesByRaffle().subscribe({
      next: (sales) => {
        this.raffleSales = sales;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading raffle sales:', error);
        this.isLoading = false;
      }
    });
  }

  loadDailySales() {
    this.isLoading = true;
    const startDate = this.dateRange.startDate || this.getDefaultStartDate();
    const endDate = this.dateRange.endDate || this.getDefaultEndDate();

    this.apiService.getDailySales(startDate, endDate).subscribe({
      next: (sales) => {
        this.dailySales = sales;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading daily sales:', error);
        this.isLoading = false;
      }
    });
  }

  loadSalesStatistics() {
    this.isLoading = true;
    this.apiService.getSalesStatistics().subscribe({
      next: (stats) => {
        this.salesStats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sales statistics:', error);
        this.isLoading = false;
      }
    });
  }

  loadPendingReceipts() {
    this.isLoading = true;
    this.apiService.getPendingReceipts().subscribe({
      next: (orders) => {
        this.pendingReceipts = orders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading pending receipts:', error);
        this.isLoading = false;
      }
    });
  }

  // ============ UTILITY METHODS ============

  getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Last 30 days
    return date.toISOString().split('T')[0];
  }

  getDefaultEndDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatMonthYear(year: number, month: number): string {
    return new Date(year, month - 1).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }

  // ============ ACTION METHODS ============

  markReceiptAsSent(order: Order) {
    this.apiService.markReceiptSent(order._id).subscribe({
      next: (updatedOrder) => {
        // Remove from pending receipts if in that view
        if (this.selectedView === 'pending-receipts') {
          const index = this.pendingReceipts.findIndex(o => o._id === order._id);
          if (index > -1) {
            this.pendingReceipts.splice(index, 1);
          }
        }
        // Update in user orders if present
        const userOrderIndex = this.userOrders.findIndex(o => o._id === order._id);
        if (userOrderIndex > -1) {
          this.userOrders[userOrderIndex] = updatedOrder;
        }
        console.log('Receipt marked as sent successfully');
      },
      error: (error) => {
        console.error('Error marking receipt as sent:', error);
      }
    });
  }

  exportData() {
    switch (this.selectedView) {
      case 'monthly-sales':
        this.exportMonthlySales();
        break;
      case 'raffle-sales':
        this.exportRaffleSales();
        break;
      case 'daily-sales':
        this.exportDailySales();
        break;
      default:
        this.exportOrders();
        break;
    }
  }

  exportOrders() {
    this.apiService.exportOrdersToCSV({
      startDate: this.dateRange.startDate,
      endDate: this.dateRange.endDate
    });
  }

  exportMonthlySales() {
    // Implement CSV export for monthly sales
    this.downloadAsCSV(
      this.monthlySales,
      `monthly_sales_${this.selectedYear}.csv`,
      ['Year', 'Month', 'Total Sales', 'Base Amount', 'Tax Amount', 'Total Orders', 'Total Tickets', 'Average Order Value']
    );
  }

  exportRaffleSales() {
    this.downloadAsCSV(
      this.raffleSales,
      'raffle_sales.csv',
      ['Raffle Name', 'Total Sales', 'Total Tickets', 'Total Orders']
    );
  }

  exportDailySales() {
    this.downloadAsCSV(
      this.dailySales,
      `daily_sales_${this.dateRange.startDate}_to_${this.dateRange.endDate}.csv`,
      ['Date', 'Total Sales', 'Total Orders', 'Total Tickets']
    );
  }

  private downloadAsCSV(data: any[], filename: string, headers: string[]) {
    if (!data.length) {
      alert('No data to export');
      return;
    }

    const csvContent = this.convertToCSV(data, headers);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: any[], headers: string[]): string {
    const headerRow = headers.join(',');
    const dataRows = data.map(item => {
      return Object.values(item).map(value =>
        `"${String(value).replace(/"/g, '""')}"`
      ).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
  }

  // ============ FILTER METHODS ============

  applyDateFilter() {
    if (this.selectedView === 'daily-sales') {
      this.loadDailySales();
    } else if (this.selectedView === 'user-orders') {
      this.loadUserOrders();
    }
  }

  applyYearFilter() {
    if (this.selectedView === 'monthly-sales') {
      this.loadMonthlySales();
    }
  }

  // ============ PAGINATION METHODS ============

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.totalOrders) {
      this.currentPage++;
      this.loadUserOrders();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUserOrders();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalOrders / this.itemsPerPage);
  }

  // ============ UI HELPER METHODS ============

  getOrderStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
        return 'status-failed';
      default:
        return 'status-unknown';
    }
  }

  getReceiptStatus(order: Order): { text: string, class: string } {
    if (order.receiptSent) {
      return { text: 'Sent', class: 'receipt-sent' };
    } else if (order.receiptError) {
      return { text: 'Failed', class: 'receipt-failed' };
    } else {
      return { text: 'Pending', class: 'receipt-pending' };
    }
  }

  // Refresh data
  refreshData() {
    this.loadViewData();
  }

  // Check if any data is available for current view
  get hasData(): boolean {
    switch (this.selectedView) {
      case 'user-orders':
        return this.userOrders.length > 0;
      case 'monthly-sales':
        return this.monthlySales.length > 0;
      case 'raffle-sales':
        return this.raffleSales.length > 0;
      case 'daily-sales':
        return this.dailySales.length > 0;
      case 'statistics':
        return this.salesStats !== null;
      case 'pending-receipts':
        return this.pendingReceipts.length > 0;
      default:
        return false;
    }
  }
}
