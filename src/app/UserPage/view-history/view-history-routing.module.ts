import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewHistoryPage } from './view-history.page';

const routes: Routes = [
  {
    path: '',
    component: ViewHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewHistoryPageRoutingModule {}
