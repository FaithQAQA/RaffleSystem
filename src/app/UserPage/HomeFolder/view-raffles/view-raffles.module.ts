import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewRafflesPageRoutingModule } from './view-raffles-routing.module';

import { ViewRafflesPage } from './view-raffles.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewRafflesPageRoutingModule,
    SharedModule
  ],
  declarations: [ViewRafflesPage]
})
export class ViewRafflesPageModule {}
