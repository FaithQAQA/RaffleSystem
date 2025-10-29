import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-app-footer',
  templateUrl: './app-footer.component.html',
  styleUrls: ['./app-footer.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class AppFooterComponent implements OnInit {
  currentYear: number;

  constructor() {
    // Initialize with the current year
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit() {}
}
