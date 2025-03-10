import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-raffle-detail',
  templateUrl: './raffle-detail.page.html',
  styleUrls: ['./raffle-detail.page.scss'],
  standalone: false,
})
export class RaffleDetailPage implements OnInit {

  raffleId: string | null = null;
  raffle: any = {};
  isSidebarOpen = true;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController // Inject ToastController
  ) {}

  ngOnInit() {
    this.raffleId = this.route.snapshot.paramMap.get('id');
    if (this.raffleId) {
      this.getRaffleDetails();
    } else {
      this.router.navigate(['/error-page']);
    }
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000, // Display for 2 seconds
      position: 'top',
      color,
    });
    await toast.present();
  }

  getRaffleDetails() {
    if (!this.raffleId) {
      console.error('Raffle ID is required!');
      return;
    }

    this.apiService.getRaffleById(this.raffleId).subscribe(
      (response) => {
        this.raffle = response;
        console.log('Raffle Details:', this.raffle);
      },
      (error) => {
        this.presentToast('Error fetching raffle details', 'danger');
        console.error('Error:', error);
      }
    );
  }

  updateRaffle() {
    if (!this.raffleId) return;

    console.log('Sending update for:', this.raffle); // Debugging

    this.apiService.updateRaffle(this.raffleId, this.raffle).subscribe({
      next: (response) => {
        this.presentToast('Raffle updated successfully!', 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Update failed:', error);
        this.presentToast(`Error updating raffle: ${error.message}`, 'danger');
      }
    });
  }

  deleteRaffle() {
    if (!this.raffleId) return;

    const confirmDelete = confirm('Are you sure you want to delete this raffle?');
    if (confirmDelete) {
      this.apiService.deleteRaffle(this.raffleId).subscribe(
        (response) => {
          this.presentToast('Raffle deleted successfully!', 'success');
          this.router.navigate(['/dashboard']);
        },
        (error) => {
          this.presentToast('Error deleting raffle', 'danger');
          console.error('Error:', error);
        }
      );
    }
  }

  navigateToCreateRaffle() {
    this.router.navigate(['/create-raffle']);
    this.presentToast('Navigating to Create Raffle', 'success');
  }

  navigateToRaffleDetail(raffleId: number) {
    this.router.navigate([`/raffle-detail/${raffleId}`]);
    this.presentToast(`Opening raffle: ${raffleId}`, 'tertiary');
  }

  navigateToRaffleManagement() {
    this.router.navigate(['/raffle-management']);
    this.presentToast('Navigating to Raffle Management', 'primary');
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
    this.presentToast('You have been logged out', 'danger');
  }
}
