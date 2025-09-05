import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewProductsPageRoutingModule } from './view-products-routing.module';

import { ViewProductsPage } from './view-products.page';
import { AppHeaderComponent } from "src/app/components/app-header/app-header.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewProductsPageRoutingModule,
    AppHeaderComponent
],
  declarations: [ViewProductsPage]
})
export class ViewProductsPageModule {}
