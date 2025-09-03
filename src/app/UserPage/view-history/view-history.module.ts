import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewHistoryPageRoutingModule } from './view-history-routing.module';

import { ViewHistoryPage } from './view-history.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewHistoryPageRoutingModule
  ],
  declarations: [ViewHistoryPage]
})
export class ViewHistoryPageModule {}
