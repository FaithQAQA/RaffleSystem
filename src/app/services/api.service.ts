import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';


export interface CartItem {
  raffleId: string;
  quantity: number;
  totalCost: number;
}


@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private baseUrl = 'https://backendserver-euba.onrender.com/api';
  private cart = new BehaviorSubject<any[]>([]);
    cart$ = this.cart.asObservable();
    private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();



  constructor(private http: HttpClient) {}

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

  // Admin Login
  login(email: string, password: string): Observable<any> {
    const url = `${this.baseUrl}/auth/login`;
    const body = { email, password };
    console.log('Sending login request to:', url);
    console.log('Request payload:', body);

    return this.http.post(url, body).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
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

  // Create Raffle
  createRaffle(raffleData: any): Observable<any> {
    const url = `${this.baseUrl}/raffles`;
    const headers = this.getHeaders();
    return this.http.post(url, raffleData, { headers }).pipe(catchError(this.handleError));
  }

  // Get All Raffles
  getAllRaffles(): Observable<any> {
    const url = `${this.baseUrl}/raffles`;
    const headers = this.getHeaders();
    console.log('Request Headers:', headers);
    return this.http.get(url, { headers }).pipe(catchError(this.handleError));
  }

  // Get Recent Raffles
  getRecentRaffles(): Observable<any> {
    const url = `${this.baseUrl}/raffles/recent`;
    const headers = this.getHeaders();
    console.log('Request Headers recent raffles:', headers);
    return this.http.get(url, { headers }).pipe(catchError(this.handleError));
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
    return this.http.put(url, raffleData, { headers }).pipe(catchError(this.handleError));
  }

  // Delete Raffle
  deleteRaffle(raffleId: string): Observable<any> {
    const url = `${this.baseUrl}/raffles/${raffleId}`;
    const headers = this.getHeaders();
    return this.http.delete(url, { headers }).pipe(catchError(this.handleError));
  }

  // Error Handling
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    console.error('API error: ', error);
    alert(errorMessage);
    return throwError(errorMessage);
  }

  loadCart() {
    this.http.get<any>(`${this.baseUrl}/cart/`, { headers: this.getHeaders() }).subscribe(cart => {
      this.cart.next(cart.items);
      this.cartCount.next(cart.items.length); // Update count
    });
  }

  addToCart(raffleId: string, quantity: number) {
    return this.http.post<any>(`${this.baseUrl}/cart/add`, { raffleId, quantity }, { headers: this.getHeaders() })
      .pipe(
        tap(cart => {
          this.cart.next(cart.items);
          this.cartCount.next(cart.items.length); // Update count
        })
      ).subscribe();
  }

  removeFromCart(raffleId: string) {
    return this.http.post<any>(`${this.baseUrl}/cart/remove`, { raffleId }, { headers: this.getHeaders() })
      .pipe(
        tap(cart => {
          this.cart.next(cart.items);
          this.cartCount.next(cart.items.length); // Update count
        })
      ).subscribe();
  }


// Clear cart
clearCart() {
  return this.http.post<any>(`${this.baseUrl}/cart/clear`, {}, { headers: this.getHeaders() })
    .pipe(
      tap(() => this.cart.next([]))
    ).subscribe();
}

// In your ApiService
getCart(): Observable<{ items: CartItem[] }> {
  return this.http.get<{ items: CartItem[] }>(`${this.baseUrl}/cart/`, { headers: this.getHeaders() });
}

getRaffleWinningChance(raffleId: string, userId: string): Observable<any> {
  const url = `${this.baseUrl}/raffles/${raffleId}/winning-chance?userId=${userId}`;
  const headers = this.getHeaders();
  return this.http.get(url, { headers });
}

}
