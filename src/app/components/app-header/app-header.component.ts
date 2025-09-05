import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { IonicModule, SearchbarInputEventDetail } from "@ionic/angular";
import { CommonModule } from '@angular/common';
import { IonSearchbarCustomEvent } from '@ionic/core';
@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
  imports: [IonicModule, CommonModule]
})
export class AppHeaderComponent implements OnInit {
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
viewSettings() {
throw new Error('Method not implemented.');
}

  cartItemCount = 0;

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.cartCount$.subscribe((count) => {
      this.cartItemCount = count;
    });
    this.apiService.loadCart();
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.router.navigate(['/login']);
  }
  viewHistory() {
    this.router.navigate(['/view-history']);
  }

  viewHome() {
    this.router.navigate(['/home']);

}

viewCart() {
    this.router.navigate(['/view-cart']);

}
viewRaffles() {
    this.router.navigate(['/view-raffles']);

}

}
