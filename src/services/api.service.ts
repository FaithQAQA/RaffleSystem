import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {


  private baseUrl = 'https://backendserver-euba.onrender.com/api'; //backend base URL



  constructor(private http: HttpClient) {}

    // Helper function to add authorization header
    private getHeaders(): HttpHeaders {
      const token = localStorage.getItem('token'); // Getting token from local storage
      return new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });
    }

      // Admin Login
  login(email: string, password: string): Observable<any> {
    const url = `${this.baseUrl}/auth/login`;
    const body = { email, password };
    return this.http.post(url, body);
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
    return this.http.get(url, { headers });
  }

}
