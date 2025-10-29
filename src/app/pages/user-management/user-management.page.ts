import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AlertController, LoadingController } from '@ionic/angular';

interface User {
  _id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  emailVerified: boolean;
  isLocked: boolean;
  failedLoginAttempts: number;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.page.html',
  styleUrls: ['./user-management.page.scss'],
  standalone: false
})
export class UserManagementPage implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  currentPage = 1;
  itemsPerPage = 10;
  totalUsers = 0;
  totalPages = 0;
  searchTerm = '';
  filterAdmin: string = 'all';
  filterVerified: string = 'all';
  loading = true;

  // Statistics
  stats = {
    totalUsers: 0,
    adminUsers: 0,
    verifiedUsers: 0,
    lockedUsers: 0,
    newUsers: 0,
    regularUsers: 0
  };

  constructor(
    private router: Router,
    private apiService: ApiService,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadUsers();
    this.loadUserStats();
  }

  async loadUsers() {
    const loading = await this.loadingController.create({
      message: 'Loading users...',
    });
    await loading.present();

    try {
      const filters: any = {};
      if (this.filterAdmin !== 'all') {
        filters.isAdmin = this.filterAdmin === 'true';
      }
      if (this.filterVerified !== 'all') {
        filters.emailVerified = this.filterVerified === 'true';
      }
      if (this.searchTerm) {
        filters.search = this.searchTerm;
      }

      const response = await this.apiService.getUsers(this.currentPage, this.itemsPerPage, filters).toPromise();
      this.users = response.users;
      this.filteredUsers = this.users;
      this.totalUsers = response.pagination.totalUsers;
      this.totalPages = response.pagination.totalPages;
    } catch (error) {
      console.error('Error loading users:', error);
      this.presentAlert('Error', 'Failed to load users');
    } finally {
      this.loading = false;
      await loading.dismiss();
    }
  }

  async loadUserStats() {
    try {
      this.stats = await this.apiService.getUserStats().toPromise();
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadUsers();
  }

  async refreshUsers() {
    this.currentPage = 1;
    await this.loadUsers();
    await this.loadUserStats();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  async toggleAdminStatus(user: User) {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: `Are you sure you want to ${user.isAdmin ? 'remove admin rights from' : 'make'} ${user.username}?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: async () => {
            try {
              await this.apiService.updateUser(user._id, { isAdmin: !user.isAdmin }).toPromise();
              this.presentAlert('Success', `User ${user.isAdmin ? 'removed from' : 'added to'} admin successfully`);
              this.loadUsers();
              this.loadUserStats();
            } catch (error) {
              console.error('Error updating user:', error);
              this.presentAlert('Error', 'Failed to update user');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteUser(user: User) {
    const alert = await this.alertController.create({
      header: 'Delete User',
      message: `Are you sure you want to delete ${user.username}? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          cssClass: 'danger-button',
          handler: async () => {
            try {
              await this.apiService.deleteUser(user._id).toPromise();
              this.presentAlert('Success', 'User deleted successfully');
              this.loadUsers();
              this.loadUserStats();
            } catch (error) {
              console.error('Error deleting user:', error);
              this.presentAlert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Add this method to your component class
getDisplayEnd(): number {
  return Math.min(this.currentPage * this.itemsPerPage, this.totalUsers);
}

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Navigation methods
  navigateToTransactionHistory() {
    this.router.navigate(['/transaction-history']);
  }

  navigateToUserManagement() {
    // Already on user management page
  }

  // Safe access methods
getSafeUsername(user: User): string {
  return user?.username || 'Unknown User';
}

getSafeEmail(user: User): string {
  return user?.email || 'No email';
}

getSafeUserId(user: User): string {
  return user?._id ? user._id.slice(-8) : 'Unknown';
}

getSafeInitial(user: User): string {
  const username = this.getSafeUsername(user);
  return username.charAt(0).toUpperCase();
}

getSafeCreatedDate(user: User): string {
  return user?.createdAt ? this.formatDate(user.createdAt) : 'Unknown';
}


}
