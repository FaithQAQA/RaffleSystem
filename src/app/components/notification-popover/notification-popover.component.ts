import { Component, OnInit } from '@angular/core';
import { IonList, IonItem } from "@ionic/angular/standalone";

@Component({
  selector: 'app-notification-popover',
  templateUrl: './notification-popover.component.html',
  styleUrls: ['./notification-popover.component.scss'],
  standalone: false,

})
export class NotificationPopoverComponent  implements OnInit {

  constructor() { }

  notifications = [
    { title: 'New Raffle', message: 'A new raffle has been added!' },
    { title: 'Winner Announced', message: 'Check if you’ve won the last raffle!' },
    { title: 'Special Offer', message: 'Get 2 tickets for the price of 1!' },
  ];

  ngOnInit() {}

}
