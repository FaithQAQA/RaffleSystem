import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RaffleDetailPage } from './raffle-detail.page';

const routes: Routes = [
  {
    path: '',
    component: RaffleDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RaffleDetailPageRoutingModule {}
