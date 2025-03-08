import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

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

  constructor(private apiService: ApiService, private router: Router) {}

  createRaffle() {
    const raffleData = {
      title: this.name, // Changed from 'name' to 'title' to match the backend structure
      description: this.description,
      category: this.category,
      price: this.ticketPrice, // Changed from 'ticketPrice' to 'price'
      startDate: this.startDate,
      endDate: this.endDate,
      status: 'active', // Assuming a default status
      raised: 0, // Starting with 0 raised amount
      raffleItems: [], // Assuming an empty array for now
      participants: [] // Assuming an empty array for now
    };

    this.apiService.createRaffle(raffleData).pipe(
      catchError((error) => {
        alert('Error creating raffle');
        console.error('Raffle creation error:', error);
        return throwError(error);
      })
    ).subscribe(
      (response) => {
        this.router.navigate(['/dashboard']);
      }
    );
  }

  cancelCreateRaffle() {
    this.router.navigate(['/dashboard']);
  }

  ngOnInit() {
  }

}
