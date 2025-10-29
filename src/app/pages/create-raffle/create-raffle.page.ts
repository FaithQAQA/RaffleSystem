import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-create-raffle',
  templateUrl: './create-raffle.page.html',
  styleUrls: ['./create-raffle.page.scss'],
  standalone: false,
})
export class CreateRafflePage implements OnInit {

  name: string = '';
  description: string = '';
  category: string = '';
  ticketPrice: number = 0;
  startDate: string = '';
  endDate: string = '';

  constructor(private apiService: ApiService, private router: Router, private toastController: ToastController) {}
  isSidebarOpen = false; // Sidebar is initially closed

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color,
    });
    await toast.present();
  }

  createRaffle() {
    const raffleData = {
      title: this.name,
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate,
      price: this.ticketPrice,
      category: this.category,
      status: 'active',
      raised: 0,
      raffleItems: [],
      participants: []
    };

    const missingFields: string[] = [];
    if (!this.name) missingFields.push('Title');
    if (!this.description) missingFields.push('Description');
    if (!this.startDate) missingFields.push('Start Date');
    if (!this.endDate) missingFields.push('End Date');
    if (!this.ticketPrice) missingFields.push('Ticket Price');
    if (!this.category) missingFields.push('Category');

    if (missingFields.length > 0) {
      const missingFieldsString = missingFields.join(', ');
      this.presentToast(`Please fill in the following fields: ${missingFieldsString}`, 'danger');
      return;
    }

    console.log('Creating raffle:', this.name, this.ticketPrice);

    this.apiService.createRaffle(raffleData).pipe(
      catchError((error) => {
        this.presentToast('Error creating raffle', 'danger');
        console.error('Raffle creation error:', error);
        return throwError(error);
      })
    ).subscribe(
      (response) => {
        this.router.navigate(['/raffle-management']);
      }
    );
  }

  cancelCreateRaffle() {
    this.router.navigate(['/dashboard']);
  }

  navigateToCreateRaffle() {
    this.router.navigate(['/create-raffle']);
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  navigateToRaffleDetail(raffleId: number) {
    this.router.navigate([`/raffle-detail/${raffleId}`]);
  }

  navigateToRaffleManagement() {
    this.router.navigate(['/raffle-management']);
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  navigateToUserManagement() {
  this.router.navigate(['/user-management']);
}

navigateToTransactionHistory() {
  this.router.navigate(['/transaction-history']);
}

navigateToOrderManagement() {
  this.router.navigate(['/order-management']);
}

navigateToAnalytics() {
  this.router.navigate(['/analytics']);
}

  ngOnInit() {
  }
}
