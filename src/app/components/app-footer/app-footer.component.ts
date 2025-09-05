import { Component, OnInit } from '@angular/core';
import { IonicModule } from "@ionic/angular";
import { IonFooter } from "@ionic/angular/standalone";

@Component({
  selector: 'app-app-footer',
  templateUrl: './app-footer.component.html',
  imports: [IonicModule],
  styleUrls: ['./app-footer.component.scss'],
})
export class AppFooterComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
