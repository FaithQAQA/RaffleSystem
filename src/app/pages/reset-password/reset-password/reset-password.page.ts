import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: false,
})
export class ResetPasswordPage implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  loading = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private toastController: ToastController // Added toast controller
  ) {}

  ngOnInit() {
    // Retrieve token from URL
    this.token = this.activatedRoute.snapshot.queryParamMap.get('token') || '';
    console.log('Extracted Token:', this.token);

    if (!this.token) {
      this.showToast('Invalid or missing token.', 'danger');
    }
  }

  async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
    });
    await toast.present();
  }

  onResetPassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.showToast('Please fill in both fields.', 'danger');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showToast('Passwords do not match.', 'danger');
      return;
    }

    this.loading = true;
    this.apiService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.showToast('Password reset successful!', 'success');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        console.error('Reset Password Error:', error);
        this.showToast(error.error?.message || 'Password reset failed.', 'danger');
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}
