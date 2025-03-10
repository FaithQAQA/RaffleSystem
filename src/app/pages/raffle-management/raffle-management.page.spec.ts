import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RaffleManagementPage } from './raffle-management.page';
import { ApiService } from 'src/app/services/api.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('RaffleManagementPage', () => {
  let component: RaffleManagementPage;
  let fixture: ComponentFixture<RaffleManagementPage>;
  let apiService: ApiService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,        // Mock the routing functionality
        HttpClientTestingModule,    // Mock HttpClient for API calls
      ],
      declarations: [RaffleManagementPage],  // Declare the component
      providers: [ApiService],              // Provide the ApiService
    });

    fixture = TestBed.createComponent(RaffleManagementPage);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService); // Inject ApiService
    router = TestBed.inject(Router);         // Inject Router

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Add other tests here...

});
