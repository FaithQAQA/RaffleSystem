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
  activeTab = 'profile';

  updatingProfile = false;
  changingPassword = false;
  loadingProfile = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toastController: ToastController,
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
    this.loadingProfile = true;

    const loading = await this.loadingController.create({
      message: 'Loading profile...',
      spinner: 'crescent'
    });
    await loading.present();

    this.apiService.getCurrentUserProfile().subscribe({
      next: (response) => {
        console.log('Profile response:', response);

        if (response && (response._id || response.user?._id)) {
          this.user = response._id ? response : response.user;

          this.profileForm.patchValue({
            username: this.user.username || '',
            email: this.user.email || ''
          });

          this.profileForm.markAsPristine();
        } else {
          console.error('Invalid user data received:', response);
          this.showErrorToast('Invalid user data received');
        }

        this.loadingProfile = false;
        loading.dismiss();
      },
      error: async (error) => {
        console.error('Error loading profile:', error);
        this.loadingProfile = false;
        loading.dismiss();
        this.showErrorToast('Failed to load profile');
      }
    });
  }

  async updateProfile() {
    if (this.profileForm.invalid || !this.profileForm.dirty) {
      this.markFormGroupTouched(this.profileForm);
      if (!this.profileForm.dirty) {
        this.showWarningToast('No changes detected');
      }
      return;
    }

    this.updatingProfile = true;

    const loading = await this.loadingController.create({
      message: 'Updating profile...',
      spinner: 'crescent'
    });
    await loading.present();

    const profileData = this.profileForm.value;

    this.apiService.updateUserProfile(profileData).subscribe({
      next: async (response) => {
        console.log('Backend response received:', response);

        this.updatingProfile = false;
        loading.dismiss();

        // Handle different possible backend formats
        const updatedUser =
          response?._id ? response :
          response?.user ? response.user : null;

        if (updatedUser) {
          this.user = updatedUser;

          this.profileForm.patchValue({
            username: this.user.username,
            email: this.user.email
          });
          this.profileForm.markAsPristine();

          this.showSuccessToast('Profile updated successfully!');

          // If email was changed, show verification reminder
          if (profileData.email && profileData.email !== this.user.email) {
            this.showWarningToast('Please verify your new email address');
          }
        } else if (response?.success) {
          // Basic success response without user data
          this.showSuccessToast('Profile updated successfully!');
        } else {
          console.error('Unexpected response format:', response);
          this.showErrorToast('Invalid response from server');
        }
      },
      error: async (error) => {
        console.error('Error updating profile:', error);
        this.updatingProfile = false;
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

    this.changingPassword = true;

    const loading = await this.loadingController.create({
      message: 'Changing password...',
      spinner: 'crescent'
    });
    await loading.present();

    const passwordData = {
      currentPassword: this.passwordForm.get('currentPassword')?.value,
      newPassword: this.passwordForm.get('newPassword')?.value
    };

    this.apiService.updateUserProfile(passwordData).subscribe({
      next: async (response) => {
        console.log('Password change response:', response);

        this.changingPassword = false;
        loading.dismiss();

        this.passwordForm.reset();
        this.passwordForm.markAsPristine();
        this.passwordForm.markAsUntouched();

        this.showSuccessToast('Password changed successfully!');
      },
      error: async (error) => {
        console.error('Error changing password:', error);
        this.changingPassword = false;
        loading.dismiss();
        this.showErrorToast(error.error?.message || 'Failed to change password');
      }
    });
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'success',
      buttons: [{ icon: 'checkmark-circle', side: 'start' }]
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      position: 'bottom',
      color: 'danger',
      buttons: [{ icon: 'close-circle', side: 'start' }]
    });
    await toast.present();
  }

  private async showWarningToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      position: 'bottom',
      color: 'warning',
      buttons: [{ icon: 'warning', side: 'start' }]
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

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'profile') {
      this.profileForm.markAsPristine();
    } else if (tab === 'password') {
      this.passwordForm.markAsPristine();
      this.passwordForm.markAsUntouched();
    }
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['email']) return 'Please enter a valid email address';
    if (field.errors['minlength'])
      return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
    if (field.errors['maxlength'])
      return `Maximum ${field.errors['maxlength'].requiredLength} characters allowed`;
    if (form.errors?.['passwordMismatch'] && fieldName === 'confirmPassword')
      return 'Passwords do not match';

    return '';
  }

  isNewPasswordDifferent(): boolean {
    const currentPassword = this.passwordForm.get('currentPassword')?.value;
    const newPassword = this.passwordForm.get('newPassword')?.value;
    return !!(newPassword && currentPassword && newPassword !== currentPassword);
  }

  getPasswordStrength(): number {
    const password = this.passwordForm.get('newPassword')?.value;
    if (!password) return 0;

    let strength = 0;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  }

  getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrength();
    if (strength < 50) return '#e53e3e';
    if (strength < 75) return '#d69e2e';
    return '#48bb78';
  }

  hasProfileChanges(): boolean {
    return this.profileForm.dirty;
  }

  resetProfileForm() {
    if (this.user) {
      this.profileForm.patchValue({
        username: this.user.username,
        email: this.user.email
      });
      this.profileForm.markAsPristine();
    }
  }

  clearPasswordForm() {
    this.passwordForm.reset();
    this.passwordForm.markAsPristine();
    this.passwordForm.markAsUntouched();
  }

  onSegmentChange(event: any) {
    const tab = event.detail.value;
    this.setActiveTab(tab);
  }

  getUserInitials(): string {
    if (!this.user?.username) return 'U';
    return this.user.username.charAt(0).toUpperCase();
  }

  hasPremiumFeatures(): boolean {
    return this.user?.premium || false;
  }

  getAccountType(): string {
    return this.hasPremiumFeatures() ? 'Premium Member' : 'Standard Member';
  }
}
