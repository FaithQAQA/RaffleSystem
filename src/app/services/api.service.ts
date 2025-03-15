import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'https://backendserver-euba.onrender.com/api';

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
      })
    );
  }

  verifyEmail(token: string): Observable<any> {
    console.log('Calling verify email API with token:', token);
    return this.http.get(`${this.baseUrl}/auth/verify-email?token=${token}`);
  }

  // Admin Register
  register(username: string, email: string, password: string): Observable<any> {
    const url = `${this.baseUrl}/auth/register`;
    const body = { username, email, password };
    return this.http.post(url, body);
  }

  // Create Raffle
  createRaffle(raffleData: any): Observable<any> {
    const url = `${this.baseUrl}/raffles`;
    const headers = this.getHeaders();
    return this.http.post(url, raffleData, { headers });
  }

  // Get All Raffles
  getAllRaffles(): Observable<any> {
    const url = `${this.baseUrl}/raffles`;
    const headers = this.getHeaders();
    console.log('Request Headers:', headers);
    return this.http.get(url, { headers });
  }

  // Get Recent Raffles
  getRecentRaffles(): Observable<any> {
    const url = `${this.baseUrl}/raffles/recent`;
    const headers = this.getHeaders();
    return this.http.get(url, { headers });
  }

  // Fetch Raffle by ID
  getRaffleById(raffleId: string): Observable<any> {
    const url = `${this.baseUrl}/raffles/${raffleId}`;
    const headers = this.getHeaders();
    return this.http.get(url, { headers });
  }

  // Update Raffle
  updateRaffle(raffleId: string, raffleData: any): Observable<any> {
    const url = `${this.baseUrl}/raffles/${raffleId}`;
    const headers = this.getHeaders();
    return this.http.put(url, raffleData, { headers });
  }

  // Delete Raffle
  deleteRaffle(raffleId: string): Observable<any> {
    const url = `${this.baseUrl}/raffles/${raffleId}`;
    const headers = this.getHeaders();
    return this.http.delete(url, { headers });
  }
}
