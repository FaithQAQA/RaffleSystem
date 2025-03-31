import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewCartPage } from './view-cart.page';

const routes: Routes = [
  {
    path: '',
    component: ViewCartPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewCartPageRoutingModule {}
