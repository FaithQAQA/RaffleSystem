import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { ToastController } from '@ionic/angular';
@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.page.html',
  styleUrls: ['./forget-password.page.scss'],
  standalone: false,
})
export class ForgetPasswordPage implements OnInit {

  email: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router, private apiService: ApiService,     private toastController: ToastController ) {}

  ngOnInit() {


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

  // Method to handle password reset request
  onForgetPassword(): void {
    this.loading = true;
    this.errorMessage = ''; // Clear any previous error messages
    this.successMessage = ''; // Clear any previous success messages

    // Call the API service to send the reset email
    this.apiService.forgotPassword(this.email).subscribe(
      (response: any) => {
        this.loading = false;
        this.successMessage = 'Password reset email sent successfully!';
        console.log('Password reset email sent:', response);
        this.showToast('Password reset email sent successfully!', 'success');

      },
      (error: any) => {
        this.loading = false;
        this.errorMessage = 'There was an issue sending the reset email. Please try again later.';
        console.error('Error:', error);
        this.showToast(
          error.error?.message || 'Error sending reset email. Try again.',
          'danger'
        );
      }
    );
  }
}
