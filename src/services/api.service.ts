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
}
