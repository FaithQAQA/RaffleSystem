import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewRafflesPage } from './view-raffles.page';

const routes: Routes = [
  {
    path: '',
    component: ViewRafflesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewRafflesPageRoutingModule {}
