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
    confirmPassword: '', // ✅ added this
  };

  showPassword = false;
  showConfirmPassword = false;

  constructor(private authService: ApiService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  register() {
    // ✅ Step 1: Basic validation before API call
    if (!this.user.username.trim() || !this.user.email.trim() || !this.user.password.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    // ✅ Step 2: Proceed with registration API call
    this.authService
      .register(this.user.username.trim(), this.user.email.trim(), this.user.password.trim())
      .subscribe(
        (res) => {
          alert('Registration successful! Please check your email to verify your account.');
          this.router.navigate(['/login']);
        },
        (err) => {
          console.error('Registration failed', err);
          alert(err.error.message || 'Registration failed. Try again.');
        }
      );
  }
}
