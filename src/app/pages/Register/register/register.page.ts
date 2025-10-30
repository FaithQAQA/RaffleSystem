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
  isLoading = false; // ✅ new state for loading indicator

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

    this.isLoading = true; // ✅ Start loading

    this.authService
      .register(this.user.username.trim(), this.user.email.trim(), this.user.password.trim())
      .subscribe({
        next: (res) => {
          alert('Registration successful! Please check your email to verify your account.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Registration failed', err);
          alert(err.error?.message || 'Registration failed. Try again.');
        },
        complete: () => {
          this.isLoading = false; // ✅ Stop loading regardless of outcome
        },
      });
  }
}
