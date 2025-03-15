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
  };

  constructor(private authService: ApiService, private router: Router) {}


  register() {
    this.authService.register(this.user.username.trim(), this.user.email.trim(), this.user.password.trim())

    .subscribe(
      (res) => {
      

        alert('Registration successful! Please check your email to verify your account.');
      },
      (err) => {
        console.error('Registration failed', err);
        alert(err.error.message || 'Registration failed. Try again.');
      }
    );
  }

}
