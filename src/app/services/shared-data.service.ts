// shared-data.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private recentOrders: any[] = [];

  setRecentOrders(orders: any[]) {
    this.recentOrders = orders;
  }

  getRecentOrders(): any[] {
    return this.recentOrders;
  }

  clearRecentOrders() {
    this.recentOrders = [];
  }
}
