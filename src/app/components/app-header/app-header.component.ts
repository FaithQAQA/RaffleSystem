import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  imports: [IonicModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeaderComponent implements OnInit {

  // ⭐ Expose directly for async pipe
  cartItemCount$ = this.apiService.cartCount$;

  private isNavigating = false;

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    // Load the cart once when header initializes
    this.apiService.loadCart();
  }

  private async navigateTo(route: string[]): Promise<void> {
    if (this.isNavigating) return;

    this.isNavigating = true;

    try {
      await this.router.navigate(route);
    } finally {
      setTimeout(() => (this.isNavigating = false), 300);
    }
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }

  viewHistory() {
    this.navigateTo(['/view-history']);
  }

  viewHome() {
    this.navigateTo(['/home']);
  }

  viewCart() {
    this.navigateTo(['/view-cart']);
  }

  viewRaffles() {
    this.navigateTo(['/view-raffles']);
  }

  viewSettings() {
    this.navigateTo(['/settings']);
  }
}
