import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewCartPageRoutingModule } from './view-cart-routing.module';

import { ViewCartPage } from './view-cart.page';
import { AppHeaderComponent } from "src/app/components/app-header/app-header.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewCartPageRoutingModule,
    AppHeaderComponent
],
  declarations: [ViewCartPage]
})
export class ViewCartPageModule {}
