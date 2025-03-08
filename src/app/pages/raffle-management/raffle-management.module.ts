import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RaffleManagementPageRoutingModule } from './raffle-management-routing.module';

import { RaffleManagementPage } from './raffle-management.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RaffleManagementPageRoutingModule
  ],
  declarations: [RaffleManagementPage]
})
export class RaffleManagementPageModule {}
