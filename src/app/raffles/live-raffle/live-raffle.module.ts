import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LiveRafflePageRoutingModule } from './live-raffle-routing.module';

import { LiveRafflePage } from './live-raffle.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LiveRafflePageRoutingModule
  ],
  declarations: [LiveRafflePage]
})
export class LiveRafflePageModule {}
