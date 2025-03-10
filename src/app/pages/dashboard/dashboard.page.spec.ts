import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard.page';
import { ApiService } from 'src/app/services/api.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let apiService: ApiService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,        // Mock Router for testing navigation
        HttpClientTestingModule,    // Mock HttpClient for API calls
      ],
      declarations: [DashboardPage], // Declare the component being tested
      providers: [ApiService],      // Provide the ApiService for testing
    });

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService); // Inject ApiService
    router = TestBed.inject(Router);         // Inject Router

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Add other test cases for your component
});
