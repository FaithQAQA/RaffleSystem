import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
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
  isLoading: boolean = false; // New state for button loading

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async presentToast(message: string, color: string = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000, // 3 seconds
      position: 'top',
      color,
    });
    await toast.present();
  }

  login() {
    if (!this.email || !this.password) {
      this.presentToast('Email and password are required', 'warning');
      return;
    }

    this.isLoading = true; // Start loading

    this.apiService.login(this.email, this.password).subscribe(
      async (response: any) => {
        this.isLoading = false; // Stop loading

        if (response?.token) {
          localStorage.setItem('userId', response.id);
          localStorage.setItem('adminToken', response.token);
          localStorage.setItem('isAdmin', response?.isAdmin ? 'true' : 'false');

          if (response.isAdmin) {
            await this.presentToast('Admin login successful!', 'success');
            this.router.navigate(['/dashboard']);
          } else {
            await this.presentToast('Login successful!', 'success');
            this.router.navigate(['/home']);
          }
        }
      },
      async (error) => {
        this.isLoading = false; // Stop loading

        if (error.error?.type === 'credentials') {
          await this.presentToast('Invalid email or password', 'danger');
        } else if (error.error?.type === 'locked') {
          const unlockTime = error.error.lockUntil ? new Date(error.error.lockUntil) : null;
          if (unlockTime && !isNaN(unlockTime.getTime())) {
            await this.presentToast(`Account is locked. Try again after ${unlockTime.toLocaleString()}`, 'warning');
          } else {
            await this.presentToast('Account is locked. Try again later.', 'warning');
          }
        } else {
          await this.presentToast('An unexpected error occurred. Please try again.', 'danger');
        }
      }
    );
  }
  goToForgotPassword() {
    this.router.navigate(['/forget-password']);
  }

  ngOnInit() {}
}
