import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
  standalone: false,
})
export class VerifyEmailPage implements OnInit {
  message: string = 'Verifying your email...';

  constructor(
    private route: ActivatedRoute,
    private authService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('VerifyEmailPage loaded');
    this.verifyEmail();
  }

  verifyEmail() {
    const token = this.route.snapshot.queryParamMap.get('token');
    console.log('Extracted token:', token);

    if (!token) {
      this.message = 'Invalid verification link!';
      return;
    }

    this.authService.verifyEmail(token).subscribe(
      (res) => {
        console.log('Verification success:', res);
        this.message = 'Email verified successfully! Redirecting...';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      (err) => {
        console.error('Verification failed:', err);
        this.message = err.error?.message || 'Verification failed!';
      }
    );
  }
}
