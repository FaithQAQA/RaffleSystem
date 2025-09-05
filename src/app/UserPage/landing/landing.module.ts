import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LandingPageRoutingModule } from './landing-routing.module';

import { LandingPage } from './landing.page';
import { AppHeaderComponent } from "src/app/components/app-header/app-header.component";
import { AppFooterComponent } from "src/app/components/app-footer/app-footer.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LandingPageRoutingModule,
    AppHeaderComponent,
    AppFooterComponent
],
  declarations: [LandingPage]
})
export class LandingPageModule {}
