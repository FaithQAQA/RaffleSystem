import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.page.html',
  styleUrls: ['./forget-password.page.scss'],
  standalone: false,
})
export class ForgetPasswordPage implements OnInit {

  email: string = '';

  constructor(private router: Router) {}

  ngOnInit() {}

  submitEmail() {
    // You can add logic to handle email validation or API call to send reset instructions
    // Here we are just navigating to the dashboard
    this.router.navigate(['/dashboard']);
  }

}
