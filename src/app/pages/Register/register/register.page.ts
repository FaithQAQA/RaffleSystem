import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  user = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  registrationCompleted = false; // New flag to show resend button
  registeredEmail = ''; // Store email for resending

  constructor(private authService: ApiService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  register() {
    if (!this.user.username.trim() || !this.user.email.trim() || !this.user.password.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    this.isLoading = true;

    this.authService
      .register(this.user.username.trim(), this.user.email.trim(), this.user.password.trim())
      .subscribe({
        next: (res) => {
          this.registrationCompleted = true;
          this.registeredEmail = this.user.email;
          alert('Registration successful! Please check your email to verify your account.');
        },
        error: (err) => {
          console.error('Registration failed', err);
          alert(err.error?.message || 'Registration failed. Try again.');
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  // New method to resend verification email
  resendVerificationEmail() {
    if (!this.registeredEmail) {
      alert('No email found to resend verification.');
      return;
    }

    this.isLoading = true;

    this.authService.resendVerificationEmail(this.registeredEmail).subscribe({
      next: (res) => {
        alert('Verification email resent! Please check your inbox.');
      },
      error: (err) => {
        console.error('Failed to resend verification email', err);
        alert(err.error?.message || 'Failed to resend verification email. Try again.');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  // Navigate to login
  goToLogin() {
    this.router.navigate(['/login']);
  }
}
