import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RaffleManagementPage } from './raffle-management.page';

const routes: Routes = [
  {
    path: '',
    component: RaffleManagementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RaffleManagementPageRoutingModule {}
