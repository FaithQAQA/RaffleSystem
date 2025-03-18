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
    const data = { email: this.email, password: this.password };

    this.apiService.login(data.email, data.password).subscribe(
      async (response: any) => {
        if (response?.token) {
          localStorage.setItem('adminToken', response.token);
          localStorage.setItem('isAdmin', response?.isAdmin ? 'true' : 'false'); // Prevents undefined issues

          console.log('Login successful! Token:', response.token);
          console.log('User is admin:', response.isAdmin);

          if (response.isAdmin) {
            await this.presentToast('Admin login successful!', 'success');
            this.router.navigate(['/dashboard']); // Redirect admin
          } else {
            await this.presentToast('Login successful!', 'success');
            this.router.navigate(['/home']); // Redirect normal user
          }
        }
      },
      async (error) => {
        console.error('Login error:', error);

        if (error.error?.type === 'credentials') {
          console.warn('Invalid credentials:', error.error.message);
          await this.presentToast('Invalid email or password', 'danger');
        } else if (error.error?.type === 'locked') {
          const unlockTime = error.error.lockUntil ? new Date(error.error.lockUntil) : null;
          if (unlockTime && !isNaN(unlockTime.getTime())) {
            const formattedTime = unlockTime.toLocaleString();
            console.warn('Account locked until:', formattedTime);
            await this.presentToast(
              `Account is locked. Try again after ${formattedTime}`,
              'warning'
            );
          } else {
            console.error('Invalid lockUntil timestamp:', error.error.lockUntil);
            await this.presentToast('Account is locked. Try again later.', 'warning');
          }
        } else {
          console.error('Unexpected server error:', error);
          await this.presentToast(
            'An unexpected error occurred. Please try again.',
            'danger'
          );
        }
      }
    );
  }

  goToForgotPassword() {
    this.router.navigate(['/forget-password']);
  }

  ngOnInit() {}
}
