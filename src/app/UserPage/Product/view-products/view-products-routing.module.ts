import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewProductsPage } from './view-products.page';

const routes: Routes = [
  {
    path: '',
    component: ViewProductsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewProductsPageRoutingModule {}
