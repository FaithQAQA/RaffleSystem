import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RaffleDetailPageRoutingModule } from './raffle-detail-routing.module';

import { RaffleDetailPage } from './raffle-detail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RaffleDetailPageRoutingModule
  ],
  declarations: [RaffleDetailPage]
})
export class RaffleDetailPageModule {}
