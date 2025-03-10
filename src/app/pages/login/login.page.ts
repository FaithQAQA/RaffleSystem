import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  constructor(private apiService: ApiService, private router: Router) {}

  login() {
    const data = { email: this.email, password: this.password };

    this.apiService.login(data.email, data.password).pipe(
      catchError(error => {
        // Show alert for failed login attempt
        alert('Login failed');
        console.error('Login error:', error);
        return throwError(error); // rethrow error to propagate it
      })
    ).subscribe(
      (response: any) => {
        // If response contains a token, navigate to the dashboard
        if (response && response.token) {
          localStorage.setItem('adminToken', response.token);
          this.router.navigate(['/dashboard']);
        } else {
          // If no token, alert invalid credentials
          alert('Invalid credentials!');
        }
      },
      error => {
        // Handle any additional errors if necessary (already handled in catchError)
        console.error('An error occurred during login:', error);
      }
    );
  }




  goToForgotPassword() {
    this.router.navigate(['/forget-password']);
  }

  ngOnInit() {
  }
}
