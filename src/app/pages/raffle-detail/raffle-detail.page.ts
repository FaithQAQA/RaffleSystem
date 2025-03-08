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

  raffleId: string | null = null;
  raffle: any = {};

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.raffleId = this.route.snapshot.paramMap.get('id');  // Get raffle ID from URL
    if (this.raffleId) {
      this.getRaffleDetails();  // Fetch raffle details if ID is valid
    } else {
      this.router.navigate(['/error-page']);  // Navigate to an error page if raffle ID is missing
    }
  }

  // Fetch raffle details from the API
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
        alert('Error fetching raffle details');
        console.error('Error:', error);
      }
    );
  }

  // Update raffle details
  updateRaffle() {
    if (!this.raffleId) return;

    this.apiService.updateRaffle(this.raffleId, this.raffle).subscribe(
      (response) => {
        alert('Raffle updated successfully!');
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        alert('Error updating raffle');
        console.error('Error:', error);
      }
    );
  }

  // Delete raffle
  deleteRaffle() {
    if (!this.raffleId) return;

    const confirmDelete = confirm('Are you sure you want to delete this raffle?');
    if (confirmDelete) {
      this.apiService.deleteRaffle(this.raffleId).subscribe(
        (response) => {
          alert('Raffle deleted successfully!');
          this.router.navigate(['/dashboard']);
        },
        (error) => {
          alert('Error deleting raffle');
          console.error('Error:', error);
        }
      );
    }
  }
}
