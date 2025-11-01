import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LiveRafflePage } from './live-raffle.page';

const routes: Routes = [
  {
    path: '',
    component: LiveRafflePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LiveRafflePageRoutingModule {}
