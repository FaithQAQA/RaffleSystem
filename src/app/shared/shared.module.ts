import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { AppHeaderComponent } from '../components/app-header/app-header.component';
import { AppFooterComponent } from '../components/app-footer/app-footer.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AppHeaderComponent,
    AppFooterComponent
  ],
  exports: [
    AppHeaderComponent,
    AppFooterComponent
  ]
})
export class SharedModule {}
