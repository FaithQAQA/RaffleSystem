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

  constructor(private apiService: ApiService, private router: Router) {}

  login() {
    const data = { email: this.email, password: this.password };
    this.apiService.login(data.email, data.password)
      .pipe(
        catchError(error => {
          alert('Login failed');
          console.error('Login error:', error);
          return throwError(error);
        })
      )
      .subscribe(response => {
        if (response && response.token) {
          localStorage.setItem('adminToken', response.token);
          this.router.navigate(['/dashboard']);
        } else {
          alert('Invalid credentials!');
        }
      });
  }

  goToForgotPassword() {
    this.router.navigate(['/forget-password']);
  }

  ngOnInit() {
  }
}
