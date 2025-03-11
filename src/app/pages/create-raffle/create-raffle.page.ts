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
  standalone:false,
})
export class CreateRafflePage implements OnInit {

  name: string = '';
  description: string = '';
  category: string = '';
  ticketPrice: number = 0;
  startDate: string = '';
  endDate: string = '';

  constructor(private apiService: ApiService, private router: Router,    private toastController: ToastController ) {}
  isSidebarOpen = false; // Sidebar is initially open


  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000, // Display for 2 seconds
      position: 'top',
      color,
    });
    await toast.present();
  }



  createRaffle() {
    // Create the raffle data object
    const raffleData = {
      title: this.name, // Changed from 'name' to 'title' to match the backend structure
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate,
      price: this.ticketPrice, // Changed from 'ticketPrice' to 'price'
      category: this.category,
      status: 'active', // Assuming a default status
      raised: 0, // Starting with 0 raised amount
      raffleItems: [], // Assuming an empty array for now
      participants: [] // Assuming an empty array for now
    };

    // Validate if all required fields are filled
    const missingFields: string[] = [];

    if (!this.name) missingFields.push('Title');
    if (!this.description) missingFields.push('Description');
    if (!this.startDate) missingFields.push('Start Date');
    if (!this.endDate) missingFields.push('End Date');
    if (!this.ticketPrice) missingFields.push('Ticket Price');
    if (!this.category) missingFields.push('Category');

    // If there are missing fields, show a toast with the missing fields
    if (missingFields.length > 0) {
      const missingFieldsString = missingFields.join(', ');
      this.presentToast(`Please fill in the following fields: ${missingFieldsString}`, 'danger');
      return; // Stop the function if fields are missing
    }

    // If everything is filled, proceed to create the raffle
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
   // this.presentToast('Navigating to Create Raffle', 'success');
  }

  navigateToRaffleDetail(raffleId: number) {
    this.router.navigate([`/raffle-detail/${raffleId}`]);
  //  this.presentToast(`Opening raffle: ${raffleId}`, 'tertiary');
  }

  navigateToRaffleManagement() {
    this.router.navigate(['/raffle-management']);
   // this.presentToast('Navigating to Raffle Management', 'primary');
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
   // this.presentToast('You have been logged out', 'danger');
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    const sidebar = document.getElementById('sidebarMenu');
    if (sidebar) {
      if (this.isSidebarOpen) {
        sidebar.classList.add('show');
      } else {
        sidebar.classList.remove('show');
      }
    }
  }


  ngOnInit() {
  }

}
