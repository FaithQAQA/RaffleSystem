import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NotificationPopoverComponent } from './components/notification-popover/notification-popover.component';
import { SettingsPage } from './pages/settings/settings.page'; // Import your component
import { ReactiveFormsModule } from '@angular/forms';
import { AuthInterceptor } from './services/auth.interceptor';

@NgModule({
  declarations: [AppComponent, NotificationPopoverComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  providers: [
    // Provide RouteReuseStrategy
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    // Provide HTTP_INTERCEPTORS separately
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
