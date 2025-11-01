import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false
})
export class SettingsPage implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  user: any = null;
  loading = false;
  activeTab = 'profile';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastController: LoadingController,
    private loadingController: LoadingController
  ) {
    this.profileForm = this.createProfileForm();
    this.passwordForm = this.createPasswordForm();
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  createProfileForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  createPasswordForm(): FormGroup {
    return this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }
async loadUserProfile() {
  const loading = await this.loadingController.create({
    message: 'Loading profile...'
  });
  await loading.present();

  this.apiService.getCurrentUserProfile().subscribe({
    next: (response) => {
      // FIX: The response IS the user object, not wrapped in { user: ... }
      console.log('Profile response:', response);

      if (response && response._id) { // Check if it's a valid user object
        this.user = response; // Assign directly, not response.user
        this.profileForm.patchValue({
          username: this.user.username || '',
          email: this.user.email || ''
        });
      } else {
        console.error('Invalid user data received:', response);
        this.showErrorToast('Invalid user data received');
      }
      loading.dismiss();
    },
    error: async (error) => {
      console.error('Error loading profile:', error);
      loading.dismiss();
      this.showErrorToast('Failed to load profile');
    }
  });
}

 async updateProfile() {
  if (this.profileForm.invalid) {
    this.markFormGroupTouched(this.profileForm);
    return;
  }

  const loading = await this.loadingController.create({
    message: 'Updating profile...'
  });
  await loading.present();

  const profileData = this.profileForm.value;

  this.apiService.updateUserProfile(profileData).subscribe({
    next: async (response) => {
      loading.dismiss();

      // FIX: Response is the updated user object directly
      if (response && response._id) {
        this.user = response; // Assign directly
        this.showSuccessToast('Profile updated successfully!');

        // If email was changed, show verification message
        if (profileData.email && profileData.email !== this.user.email) {
          this.showWarningToast('Please verify your new email address');
        }
      } else {
        this.showErrorToast('Invalid response from server');
      }
    },
    error: async (error) => {
      console.error('Error updating profile:', error);
      loading.dismiss();
      this.showErrorToast(error.error?.message || 'Failed to update profile');
    }
  });
}

  async changePassword() {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Changing password...'
    });
    await loading.present();

    const passwordData = {
      currentPassword: this.passwordForm.get('currentPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value
    };

    this.apiService.updateUserProfile(passwordData).subscribe({
      next: async (response) => {
        loading.dismiss();
        this.passwordForm.reset();
        this.showSuccessToast('Password changed successfully!');
      },
      error: async (error) => {
        console.error('Error changing password:', error);
        loading.dismiss();
        this.showErrorToast(error.error?.message || 'Failed to change password');
      }
    });
  }

  // Helper methods for toast messages
  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
    });
    await toast.present();
  }

  private async showWarningToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
    });
    await toast.present();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  setActiveTab(tab: string | undefined) {
    if (tab) {
      this.activeTab = tab;
    }
  }

  // Helper method to check if form field is invalid
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Helper method to get field error message
  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return 'This field is required';
    }
    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (field.errors['minlength']) {
      return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
    }
    if (field.errors['maxlength']) {
      return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
    }

    return '';
  }
}
