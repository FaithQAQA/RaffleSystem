import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-view-history',
  templateUrl: './view-history.page.html',
  styleUrls: ['./view-history.page.scss'],
  standalone: false
})
export class ViewHistoryPage implements OnInit {

  raffles: any[] = [];

    userId = localStorage.getItem('userId')!
    cartItemCount=0;
  constructor(private apiService: ApiService, private router:Router) { }


  ngOnInit()
  {
    this.loadRaffles();
  }
  loadRaffles()
  {
        this.apiService.cartCount$.subscribe(count => {
      this.cartItemCount = count;
    });

       this.apiService.getUserRaffles(this.userId).subscribe({
      next: (data) => {
        this.raffles = data;
      },
      error: (err) => {
        console.error('Error fetching user raffles:', err);
      }
    });
  }

    toggleDarkMode()
  {
    this.router.navigate(['/view-history'])

  }

    logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }

  getStatusColor(status: string): string {
  switch(status) {
    case 'active': return 'success';
    case 'completed': return 'primary';
    case 'cancelled': return 'danger';
    default: return 'medium';
  }
}

getStatusIcon(status: string): string {
  switch(status) {
    case 'active': return 'play-circle-outline';
    case 'completed': return 'checkmark-circle-outline';
    case 'cancelled': return 'close-circle-outline';
    default: return 'help-circle-outline';
  }
}


}
