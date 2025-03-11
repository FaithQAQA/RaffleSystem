import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateRafflePage } from './create-raffle.page';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('CreateRafflePage', () => {
  let component: CreateRafflePage;
  let fixture: ComponentFixture<CreateRafflePage>;
  let apiService: jasmine.SpyObj<ApiService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['createRaffle']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [CreateRafflePage],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateRafflePage);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call createRaffle and navigate to dashboard on success', () => {
    const raffleData = {
      title: 'Test Raffle',
      description: 'Test Description',
      startDate: '2023-10-01',
      endDate: '2023-10-31',
      price: 10,
      category: 'Test Category',
      status: 'active',
      raised: 0,
      raffleItems: [],
      participants: []
    };

    apiService.createRaffle.and.returnValue(of({})); // Simulate a successful API call

    component.name = raffleData.title;
    component.description = raffleData.description;
    component.startDate = raffleData.startDate;
    component.endDate = raffleData.endDate;
    component.ticketPrice = raffleData.price;
    component.category = raffleData.category;

    component.createRaffle();

    expect(apiService.createRaffle).toHaveBeenCalledWith(raffleData);
    expect(router.navigate).toHaveBeenCalledWith(['/raffle-management']);
  });

  it('should handle error when createRaffle fails', () => {
    const raffleData = {
      title: 'Test Raffle',
      description: 'Test Description',
      startDate: '2023-10-01',
      endDate: '2023-10-31',
      price: 10,
      category: 'Test Category',
      status: 'active',
      raised: 0,
      raffleItems: [],
      participants: []
    };

    apiService.createRaffle.and.returnValue(throwError('Error')); // Simulate an error in the API call

    component.name = raffleData.title;
    component.description = raffleData.description;
    component.startDate = raffleData.startDate;
    component.endDate = raffleData.endDate;
    component.ticketPrice = raffleData.price;
    component.category = raffleData.category;

    component.createRaffle();

    expect(apiService.createRaffle).toHaveBeenCalledWith(raffleData);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to dashboard on cancelCreateRaffle', () => {
    component.cancelCreateRaffle();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });


});
