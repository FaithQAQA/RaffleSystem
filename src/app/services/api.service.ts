import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, distinctUntilChanged, debounceTime } from 'rxjs/operators';

export interface CartItem {
  raffleId: string;
  quantity: number;
  totalCost: number;
}

export interface Order {
  _id: string;
  userId: string;
  raffleId: string;
  ticketsBought: number;
  amount: number;
  baseAmount: number;
  taxAmount: number;
  status: string;
  paymentId: string;
  receiptSent: boolean;
  receiptSentAt?: string;
  receiptError?: string;
  createdAt: string;
  updatedAt?: string;
  raffle?: {
    title: string;
    price: number;
  };
  user?: {
    username: string;
    email: string;
  };
}

// Add new interfaces for analytics
export interface MonthlySales {
  year: number;
  month: number;
  totalSales: number;
  totalBaseAmount: number;
  totalTaxAmount: number;
  totalOrders: number;
  totalTickets: number;
  averageOrderValue: number;
}

export interface RaffleSales {
  _id: string;
  raffleName: string;
  totalSales: number;
  totalTickets: number;
  totalOrders: number;
}

export interface DailySales {
  date: string;
  totalSales: number;
  totalOrders: number;
  totalTickets: number;
}

export interface SalesStatistics {
  totalRevenue: number;
  totalBaseAmount: number;
  totalTaxAmount: number;
  totalOrders: number;
  totalTicketsSold: number;
  averageOrderValue: number;
  averageTicketsPerOrder: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://backendserver-euba.onrender.com/api';

  private cart = new BehaviorSubject<any[]>([]);
  cart$ = this.cart.asObservable();

  // Performance: Add distinctUntilChanged and debounce to prevent excessive emissions
  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable().pipe(
    distinctUntilChanged(),
    debounceTime(50) // Batch rapid updates
  );

  // Cache for frequent requests
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  constructor(private http: HttpClient, private ngZone: NgZone) {}

  // Helper function to add authorization header
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No valid auth token found!');
      return new HttpHeaders();
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Cache helper methods
  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Clear cache when needed (like after cart updates)
  private clearCache(): void {
    this.cache.clear();
  }

  // Helper method to generate idempotency key
  private generateIdempotencyKey(): string {
    return 'key_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // ============ OPTIMIZED CART METHODS ============
  loadCart(): void {
    const cachedCart = this.getFromCache('cart');
    if (cachedCart) {
      this.updateCartState(cachedCart.items);
      return;
    }

    this.http.get<any>(`${this.baseUrl}/cart/`, { headers: this.getHeaders() })
      .subscribe({
        next: (cart) => {
          this.setCache('cart', cart);
          this.updateCartState(cart.items);
        },
        error: (error) => {
          console.error('Error loading cart:', error);
          // Don't update state on error to prevent UI flickering
        }
      });
  }

  // Updated cart methods to use new RESTful endpoints
  addToCart(raffleId: string, quantity: number): void {
    this.http.post<any>(`${this.baseUrl}/cart/items`, { raffleId, quantity }, { headers: this.getHeaders() })
      .pipe(
        tap(cart => {
          this.clearCache(); // Clear cache since cart changed
          this.updateCartState(cart.items);
        }),
        catchError(error => {
          console.error('Error adding to cart:', error);
          return throwError(error);
        })
      )
      .subscribe();
  }

  removeFromCart(raffleId: string): void {
    this.http.delete<any>(`${this.baseUrl}/cart/items/${raffleId}`, { headers: this.getHeaders() })
      .pipe(
        tap(cart => {
          this.clearCache(); // Clear cache since cart changed
          this.updateCartState(cart.items);
        }),
        catchError(error => {
          console.error('Error removing from cart:', error);
          return throwError(error);
        })
      )
      .subscribe();
  }

  // Clear cart using new RESTful endpoint
  clearCart(): void {
    this.http.delete<any>(`${this.baseUrl}/cart/`, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          this.clearCache();
          this.updateCartState([]);
        }),
        catchError(error => {
          console.error('Error clearing cart:', error);
          return throwError(error);
        })
      )
      .subscribe();
  }

  // Get cart with caching
  getCart(): Observable<{ items: CartItem[] }> {
    const cached = this.getFromCache('cart');
    if (cached) {
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    return this.http.get<{ items: CartItem[] }>(`${this.baseUrl}/cart/`, { headers: this.getHeaders() })
      .pipe(
        tap(cart => this.setCache('cart', cart))
      );
  }

  // Centralized cart state update to prevent multiple emissions
  private updateCartState(items: any[]): void {
    // Run in NgZone to ensure change detection works properly
    this.ngZone.run(() => {
      this.cart.next(items);
      this.cartCount.next(items.length);
    });
  }

  // ============ OPTIMIZED AUTH METHODS ============
  login(email: string, password: string): Observable<any> {
    const url = `${this.baseUrl}/auth/login`;
    const body = { email, password };
    console.log('Sending login request to:', url);
    console.log('Request payload:', body);

    return this.http.post(url, body).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          this.clearCache(); // Clear all cache on login
          console.log('Token saved to localStorage');
        }
      }),
      catchError(this.handleError)
    );
  }

  verifyEmail(token: string): Observable<any> {
    console.log('Calling verify email API with token:', token);
    return this.http.get(`${this.baseUrl}/auth/verify-email?token=${token}`).pipe(
      catchError(this.handleError)
    );
  }

  // Forgot Password
  forgotPassword(email: string): Observable<any> {
    const url = `${this.baseUrl}/auth/forgot-password`;
    const body = { email };
    return this.http.post(url, body);
  }

  // Reset Password
  resetPassword(token: string, newPassword: string): Observable<any> {
    const url = `${this.baseUrl}/auth/reset-password`;
    const body = { token, newPassword };
    return this.http.post(url, body).pipe(catchError(this.handleError));
  }

  // Admin Register
  register(username: string, email: string, password: string): Observable<any> {
    const url = `${this.baseUrl}/auth/register`;
    const body = { username, email, password };
    return this.http.post(url, body).pipe(catchError(this.handleError));
  }

  // Update user profile
  updateUserProfile(profileData: {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Observable<any> {
    const url = `${this.baseUrl}/auth/profile`;
    const headers = this.getHeaders();
    return this.http.put<any>(url, profileData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Get user profile
  getUserProfile(): Observable<any> {
    const url = `${this.baseUrl}/auth/profile`;
    const headers = this.getHeaders();
    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // ============ EMAIL SERVICE METHODS ============
  getEmailServiceStatus(): Observable<any> {
    const url = `${this.baseUrl}/auth/email/status`;
    const headers = this.getHeaders();
    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  testEmailService(): Observable<any> {
    const url = `${this.baseUrl}/auth/email/test`;
    const headers = this.getHeaders();
    return this.http.get<any>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // ============ OPTIMIZED RAFFLE METHODS ============
  // Create Raffle
  createRaffle(raffleData: any): Observable<any> {
    const url = `${this.baseUrl}/raffles`;
    const headers = this.getHeaders();
    return this.http.post(url, raffleData, { headers }).pipe(
      tap(() => this.invalidateRaffleCache()),
      catchError(this.handleError)
    );
  }

  // Get All Raffles with caching
  getAllRaffles(): Observable<any> {
    const cacheKey = 'all-raffles';
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    const url = `${this.baseUrl}/raffles`;
    const headers = this.getHeaders();
    console.log('Request Headers:', headers);

    return this.http.get(url, { headers }).pipe(
      tap(data => this.setCache(cacheKey, data)),
      catchError(this.handleError)
    );
  }

  // Get Recent Raffles with caching
  getRecentRaffles(): Observable<any> {
    const cacheKey = 'recent-raffles';
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    const url = `${this.baseUrl}/raffles/recent`;
    const headers = this.getHeaders();
    console.log('Request Headers recent raffles:', headers);

    return this.http.get(url, { headers }).pipe(
      tap(data => this.setCache(cacheKey, data)),
      catchError(this.handleError)
    );
  }

  // Pick winner for raffle
  pickWinner(raffleId: string): Observable<any> {
    const url = `${this.baseUrl}/raffles/${raffleId}/pick-winner`;
    const headers = this.getHeaders();

    console.log('Calling pick winner for raffle:', raffleId);
    return this.http.post(url, {}, { headers }).pipe(
      tap(() => this.invalidateRaffleCache()),
      catchError(this.handleError)
    );
  }

  // Fetch Raffle by ID
  getRaffleById(raffleId: string): Observable<any> {
    const url = `${this.baseUrl}/raffles/${raffleId}`;
    const headers = this.getHeaders();
    return this.http.get(url, { headers }).pipe(catchError(this.handleError));
  }

  // Update Raffle
  updateRaffle(raffleId: string, raffleData: any): Observable<any> {
    const url = `${this.baseUrl}/raffles/${raffleId}`;
    const headers = this.getHeaders();
    return this.http.put(url, raffleData, { headers }).pipe(
      tap(() => this.invalidateRaffleCache()),
      catchError(this.handleError)
    );
  }

  // Delete Raffle
  deleteRaffle(raffleId: string): Observable<any> {
    const url = `${this.baseUrl}/raffles/${raffleId}`;
    const headers = this.getHeaders();
    return this.http.delete(url, { headers }).pipe(
      tap(() => this.invalidateRaffleCache()),
      catchError(this.handleError)
    );
  }

  // Invalidate cache when raffles are modified
  private invalidateRaffleCache(): void {
    this.cache.delete('all-raffles');
    this.cache.delete('recent-raffles');
  }

  // ============ ORDER METHODS ============
  // Get order details by ID
  getOrderDetails(orderId: string): Observable<Order> {
    const url = `${this.baseUrl}/orders/${orderId}`;
    const headers = this.getHeaders();
    console.log('Fetching order from:', url);

    return this.http.get<Order>(url, { headers }).pipe(
      tap(order => console.log('Order received:', order)),
      catchError(error => {
        console.error('Error fetching order details:', error);
        return throwError(error);
      })
    );
  }

  // Get user's orders
  getUserOrders(): Observable<Order[]> {
    const url = `${this.baseUrl}/orders/user/my-orders`;
    const headers = this.getHeaders();
    console.log('Fetching user orders from:', url);

    return this.http.get<Order[]>(url, { headers }).pipe(
      tap(orders => console.log('User orders received:', orders.length)),
      catchError(error => {
        console.error('Error fetching user orders:', error);
        return throwError(error);
      })
    );
  }

  // Get all orders (admin only)
  getAllOrders(): Observable<Order[]> {
    const url = `${this.baseUrl}/orders`;
    const headers = this.getHeaders();
    return this.http.get<Order[]>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // ============ PURCHASE METHOD ============
  purchaseTickets(userId: string, cartItems: CartItem[], paymentToken: string, idempotencyKey?: string): Observable<any> {
    const url = `${this.baseUrl}/raffles/purchase`;
    const headers = this.getHeaders();

    const body = {
      userId,
      cartItems,
      paymentToken,
      idempotencyKey: idempotencyKey || this.generateIdempotencyKey(),
      includeTax: true
    };

    return this.http.post(url, body, { headers })
      .pipe(catchError(this.handleError));
  }

  // Purchase single raffle tickets
  purchaseSingleRaffleTickets(userId: string, raffleId: string, ticketsBought: number, paymentToken: string, idempotencyKey?: string): Observable<any> {
    const url = `${this.baseUrl}/raffles/${raffleId}/purchase`;
    const headers = this.getHeaders();

    const body = {
      userId,
      ticketsBought,
      paymentToken,
      idempotencyKey: idempotencyKey || this.generateIdempotencyKey(),
      includeTax: true
    };

    return this.http.post(url, body, { headers })
      .pipe(catchError(this.handleError));
  }

  // ============ OTHER METHODS ============
  getRaffleWinningChance(raffleId: string, userId: string): Observable<any> {
    const url = `${this.baseUrl}/raffles/${raffleId}/winning-chance/${userId}`;
    const headers = this.getHeaders();
    return this.http.get(url, { headers });
  }

  getUserRaffles(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/user/${userId}/raffles`);
  }

  exportRaffleToCSV(raffleId: string): void {
    const url = `${this.baseUrl}/raffles/${raffleId}/export`;
    const headers = this.getHeaders();

    this.http.get(url, { headers, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const objectUrl = window.URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = `raffle_${raffleId}.csv`;
        a.click();
        window.URL.revokeObjectURL(objectUrl);
      },
      error: (err) => {
        console.error('Failed to export raffle CSV', err);
        alert('Error exporting raffle data.');
      },
    });
  }

  // ============ USER MANAGEMENT METHODS ============
  // Get all users with pagination and filters
  getUsers(page: number = 1, limit: number = 10, filters?: any): Observable<any> {
    let url = `${this.baseUrl}/users?page=${page}&limit=${limit}`;

    // Add filters if provided
    if (filters) {
      if (filters.search) url += `&search=${filters.search}`;
      if (filters.isAdmin !== undefined) url += `&isAdmin=${filters.isAdmin}`;
      if (filters.emailVerified !== undefined) url += `&emailVerified=${filters.emailVerified}`;
    }

    const headers = this.getHeaders();
    return this.http.get<any>(url, { headers }).pipe(catchError(this.handleError));
  }

  // Get user by ID
  getUserById(userId: string): Observable<any> {
    const url = `${this.baseUrl}/users/${userId}`;
    const headers = this.getHeaders();
    return this.http.get<any>(url, { headers }).pipe(catchError(this.handleError));
  }

  // Get current user profile
  getCurrentUserProfile(): Observable<any> {
    const url = `${this.baseUrl}/users/profile/me`;
    const headers = this.getHeaders();
    return this.http.get<any>(url, { headers }).pipe(catchError(this.handleError));
  }

  // Update user
  updateUser(userId: string, userData: any): Observable<any> {
    const url = `${this.baseUrl}/users/${userId}`;
    const headers = this.getHeaders();
    return this.http.put<any>(url, userData, { headers }).pipe(catchError(this.handleError));
  }

  // Delete user
  deleteUser(userId: string): Observable<any> {
    const url = `${this.baseUrl}/users/${userId}`;
    const headers = this.getHeaders();
    return this.http.delete<any>(url, { headers }).pipe(catchError(this.handleError));
  }

  // Get user statistics
  getUserStats(): Observable<any> {
    const url = `${this.baseUrl}/users/stats/overview`;
    const headers = this.getHeaders();
    return this.http.get<any>(url, { headers }).pipe(catchError(this.handleError));
  }

  // Get registration statistics
  getRegistrationStats(days: number = 30): Observable<any> {
    const url = `${this.baseUrl}/users/stats/registration?days=${days}`;
    const headers = this.getHeaders();
    return this.http.get<any>(url, { headers }).pipe(catchError(this.handleError));
  }

  // ============ ORDER ANALYTICS METHODS ============

  // Get monthly sales with optional year filter
  getMonthlySales(year?: number): Observable<MonthlySales[]> {
    let url = `${this.baseUrl}/orders/sales/monthly`;
    if (year) {
      url += `?year=${year}`;
    }
    const headers = this.getHeaders();
    return this.http.get<MonthlySales[]>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Get sales by raffle
  getSalesByRaffle(): Observable<RaffleSales[]> {
    const url = `${this.baseUrl}/orders/sales/by-raffle`;
    const headers = this.getHeaders();
    return this.http.get<RaffleSales[]>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Get user order history
  getUserOrderHistory(userId: string): Observable<Order[]> {
    const url = `${this.baseUrl}/orders/user/${userId}/history`;
    const headers = this.getHeaders();
    return this.http.get<Order[]>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Get daily sales for a specific period
  getDailySales(startDate?: string, endDate?: string): Observable<DailySales[]> {
    let url = `${this.baseUrl}/orders/sales/daily`;
    const params: string[] = [];

    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const headers = this.getHeaders();
    return this.http.get<DailySales[]>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Add these methods to your ApiService class

// Mark receipt as sent
markReceiptSent(orderId: string): Observable<Order> {
  const url = `${this.baseUrl}/orders/${orderId}/mark-receipt-sent`;
  const headers = this.getHeaders();
  return this.http.post<Order>(url, {}, { headers }).pipe(
    catchError(this.handleError)
  );
}

// Export orders to CSV
exportOrdersToCSV(filters?: any): void {
  let url = `${this.baseUrl}/orders/export`;

  if (filters) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status) params.append('status', filters.status);

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers = this.getHeaders();

  this.http.get(url, { headers, responseType: 'blob' }).subscribe({
    next: (blob) => {
      const a = document.createElement('a');
      const objectUrl = window.URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(objectUrl);
    },
    error: (err) => {
      console.error('Failed to export orders CSV', err);
      alert('Error exporting orders data.');
    },
  });
}

// Get orders with pagination and filters (for admin)
getOrders(
  page: number = 1,
  limit: number = 10,
  filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    raffleId?: string;
  }
): Observable<{ orders: Order[]; total: number; page: number; totalPages: number }> {
  let url = `${this.baseUrl}/orders?page=${page}&limit=${limit}`;

  if (filters) {
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.startDate) url += `&startDate=${filters.startDate}`;
    if (filters.endDate) url += `&endDate=${filters.endDate}`;
    if (filters.userId) url += `&userId=${filters.userId}`;
    if (filters.raffleId) url += `&raffleId=${filters.raffleId}`;
  }

  const headers = this.getHeaders();
  return this.http.get<{ orders: Order[]; total: number; page: number; totalPages: number }>(
    url,
    { headers }
  ).pipe(
    catchError(this.handleError)
  );
}

// Get order summary with detailed information
getOrderSummary(orderId: string): Observable<any> {
  const url = `${this.baseUrl}/orders/${orderId}/summary`;
  const headers = this.getHeaders();
  return this.http.get<any>(url, { headers }).pipe(
    catchError(this.handleError)
  );
}

  // Get orders that need receipt (for admin)
  getPendingReceipts(): Observable<Order[]> {
    const url = `${this.baseUrl}/orders/receipts/pending`;
    const headers = this.getHeaders();
    return this.http.get<Order[]>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Get overall sales statistics
  getSalesStatistics(): Observable<SalesStatistics> {
    const url = `${this.baseUrl}/orders/sales/statistics`;
    const headers = this.getHeaders();
    return this.http.get<SalesStatistics>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Health check
  healthCheck(): Observable<any> {
    const url = `${this.baseUrl}/auth/health`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  // Logout method to clear state
  logout(): void {
    this.clearCache();
    this.updateCartState([]); // Reset cart state
  }

  // ============ ERROR HANDLING ============
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    console.error('API error: ', error);
    alert(errorMessage);
    return throwError(errorMessage);
  }
}
