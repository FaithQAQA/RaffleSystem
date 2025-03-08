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
      name: this.name,
      description: this.description,
      category: this.category,
      ticketPrice: this.ticketPrice,
      startDate: this.startDate,
      endDate: this.endDate,
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
