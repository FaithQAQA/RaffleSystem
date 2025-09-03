import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'create-raffle',
    loadChildren: () => import('./pages/create-raffle/create-raffle.module').then( m => m.CreateRafflePageModule)
  },
  {
    path: 'raffle-detail/:id',  // Corrected path here
    loadChildren: () => import('./pages/raffle-detail/raffle-detail.module').then( m => m.RaffleDetailPageModule)
  },
  {
    path: 'forget-password',
    loadChildren: () => import('./pages/forget-password/forget-password.module').then( m => m.ForgetPasswordPageModule)
  },
  {
    path: 'raffle-management',
    loadChildren: () => import('./pages/raffle-management/raffle-management.module').then( m => m.RaffleManagementPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/Register/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'verify-email',
    loadChildren: () => import('./pages/verify-email/verify-email.module').then( m => m.VerifyEmailPageModule)
  },
  {
    path: 'landing',
    loadChildren: () => import('./UserPage/landing/landing.module').then( m => m.LandingPageModule)
  },
  {
    path: 'view-raffles',
    loadChildren: () => import('./UserPage/HomeFolder/view-raffles/view-raffles.module').then( m => m.ViewRafflesPageModule)
  },
  {
    path: 'view-products/:id',
    loadChildren: () => import('./UserPage/Product/view-products/view-products.module').then( m => m.ViewProductsPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./pages/reset-password/reset-password/reset-password.module').then( m => m.ResetPasswordPageModule)
  },
  {
    path: 'view-cart',
    loadChildren: () => import('./UserPage/view-cart/view-cart.module').then( m => m.ViewCartPageModule)
  },
  {
    path: 'view-history',
    loadChildren: () => import('./UserPage/view-history/view-history.module').then( m => m.ViewHistoryPageModule)
  },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
