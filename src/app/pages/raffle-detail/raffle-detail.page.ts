import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-raffle-detail',
  templateUrl: './raffle-detail.page.html',
  styleUrls: ['./raffle-detail.page.scss'],
  standalone: false,
})
export class RaffleDetailPage implements OnInit {

  raffleId: string = '';
  raffle: any = {};

  constructor(private apiService: ApiService, private route: ActivatedRoute, private router: Router) {
    this.raffleId = this.route.snapshot.paramMap.get('id')!;
  }

  ionViewDidEnter() {
    this.getRaffleDetails();
  }

  getRaffleDetails() {
    this.apiService.getRaffleById(this.raffleId).subscribe(
      (response) => {
        this.raffle = response;
      },
      (error) => {
        alert('Error fetching raffle details');
        console.error('Error:', error);
      }
    );
  }

  updateRaffle() {
    this.apiService.updateRaffle(this.raffleId, this.raffle).subscribe(
      (response) => {
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        alert('Error updating raffle');
        console.error('Error:', error);
      }
    );
  }

  deleteRaffle() {
    const confirmDelete = confirm('Are you sure you want to delete this raffle?');
    if (confirmDelete) {
      this.apiService.deleteRaffle(this.raffleId).subscribe(
        (response) => {
          this.router.navigate(['/dashboard']);
        },
        (error) => {
          alert('Error deleting raffle');
          console.error('Error:', error);
        }
      );
    }
  }

  ngOnInit() {
  }

}
