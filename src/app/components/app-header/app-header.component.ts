import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { IonicModule, SearchbarInputEventDetail } from "@ionic/angular";
import { CommonModule } from '@angular/common';
import { IonSearchbarCustomEvent } from '@ionic/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router, RouterLink } from '@angular/router';
@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  imports: [IonicModule, CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  onSearch($event: IonSearchbarCustomEvent<SearchbarInputEventDetail>) {
    throw new Error('Method not implemented.');
  }
  openSocial(arg0: string) {
    throw new Error('Method not implemented.');
  }
  userEmail: any;
  viewProfile() {
    throw new Error('Method not implemented.');
  }
  viewFavorites() {
    throw new Error('Method not implemented.');
  }

  cartItemCount = 0;
  private destroy$ = new Subject<void>();
  private isNavigating = false;

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.cartCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.cartItemCount = count;
      });
    this.apiService.loadCart();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Debounced navigation to prevent multiple rapid clicks
  private async navigateTo(route: string[]): Promise<void> {
    if (this.isNavigating) return;

    this.isNavigating = true;
    try {
      await this.router.navigate(route);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setTimeout(() => {
        this.isNavigating = false;
      }, 300);
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
