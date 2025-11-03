import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

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
  isLoading: boolean = false;
  errorMessage: string = ''; // <-- For clean on-screen error display
  showPassword: boolean = false;


  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastController: ToastController
  ) {}



login() {
  this.errorMessage = ''; // Clear previous error

  if (!this.email || !this.password) {
    this.errorMessage = 'Email and password are required';
    return;
  }

  this.isLoading = true;

  this.apiService.login(this.email, this.password).subscribe(
    (response: any) => {
      this.isLoading = false;

      if (response?.token) {
        localStorage.setItem('userId', response.id);
        localStorage.setItem('adminToken', response.token);
        localStorage.setItem('isAdmin', response?.isAdmin ? 'true' : 'false');

        if (response.isAdmin) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      } else {
        this.errorMessage = 'An unexpected error occurred. Please try again.';
      }
    },
    (error) => {
      this.isLoading = false;

      // Display exact backend message inline
      if (error.error?.message) {
        this.errorMessage = error.error.message; // <-- Exact message shown on page
      } else if (error.error?.type === 'credentials') {
        this.errorMessage = 'Invalid email or password';
      } else {
        this.errorMessage = 'An unexpected error occurred. Please try again.';
      }

      console.error('Login error:', error);
    }
  );
}


  goToForgotPassword() {
    this.router.navigate(['/forget-password']);
  }

  ngOnInit() {}
}
