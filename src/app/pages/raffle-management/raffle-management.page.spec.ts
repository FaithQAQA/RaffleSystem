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
  let apiService: jasmine.SpyObj<ApiService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['getAllRaffles']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,        // Mock the routing functionality
        HttpClientTestingModule,    // Mock HttpClient for API calls
      ],
      declarations: [RaffleManagementPage],  // Declare the component
      providers: [
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    fixture = TestBed.createComponent(RaffleManagementPage);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load raffles on initialization', () => {
    const mockRaffles = [
      { _id: '67ce4377c8559ed0be26a6ab', title: 'Raffle 1', description: 'Description 1', startDate: '2025-03-09T21:41:00.000+00:00', endDate: '2025-03-29T21:41:00.000+00:00', price: 17, category: 'idk_', status: 'active', raised: 0, raffleItems: [], participants: [], createdAt: '2025-03-10T01:42:15.699+00:00', __v: 0 },
      { _id: '67ce4377c8559ed0be26a6ac', title: 'Raffle 2', description: 'Description 2', startDate: '2025-03-10T21:41:00.000+00:00', endDate: '2025-03-30T21:41:00.000+00:00', price: 20, category: 'idk_', status: 'completed', raised: 0, raffleItems: [], participants: [], createdAt: '2025-03-11T01:42:15.699+00:00', __v: 0 },
    ];

    apiService.getAllRaffles.and.returnValue(of(mockRaffles)); // Mock the API response

    component.ngOnInit(); // Trigger ngOnInit

    expect(apiService.getAllRaffles).toHaveBeenCalled(); // Verify API call
    expect(component.raffles).toEqual(mockRaffles); // Verify raffles are loaded
    expect(component.filteredRaffles).toEqual(mockRaffles); // Verify filteredRaffles is updated
  });

  it('should filter raffles based on search term and selected filter', () => {
    component.raffles = [
      { _id: '67ce4377c8559ed0be26a6ab', title: 'Raffle 1', description: 'Description 1', startDate: '2025-03-09T21:41:00.000+00:00', endDate: '2025-03-29T21:41:00.000+00:00', price: 17, category: 'idk_', status: 'active', raised: 0, raffleItems: [], participants: [], createdAt: '2025-03-10T01:42:15.699+00:00', __v: 0 },
      { _id: '67ce4377c8559ed0be26a6ac', title: 'Raffle 2', description: 'Description 2', startDate: '2025-03-10T21:41:00.000+00:00', endDate: '2025-03-30T21:41:00.000+00:00', price: 20, category: 'idk_', status: 'completed', raised: 0, raffleItems: [], participants: [], createdAt: '2025-03-11T01:42:15.699+00:00', __v: 0 },
      { _id: '67ce4377c8559ed0be26a6ad', title: 'Another Raffle', description: 'Description 3', startDate: '2025-03-11T21:41:00.000+00:00', endDate: '2025-03-31T21:41:00.000+00:00', price: 25, category: 'idk_', status: 'active', raised: 0, raffleItems: [], participants: [], createdAt: '2025-03-12T01:42:15.699+00:00', __v: 0 },
    ];

    // Test search term
    component.searchTerm = 'Raffle';
    component.filterRaffles();
    expect(component.filteredRaffles.length).toBe(3);

    // Test filter for active raffles
    component.selectedFilter = 'active';
    component.filterRaffles();
    expect(component.filteredRaffles.length).toBe(2);

    // Test filter for completed raffles
    component.selectedFilter = 'completed';
    component.filterRaffles();
    expect(component.filteredRaffles.length).toBe(1);
  });



  it('should navigate to create raffle page', () => {
    component.navigateToCreateRaffle();
    expect(router.navigate).toHaveBeenCalledWith(['/create-raffle']);
  });

  it('should logout and navigate to login page', () => {
    spyOn(localStorage, 'removeItem'); // Spy on localStorage.removeItem

    component.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('adminToken'); // Verify token is removed
    expect(router.navigate).toHaveBeenCalledWith(['/login']); // Verify navigation
  });

  it('should navigate to dashboard', () => {
    component.navigateToDashboard();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should navigate to raffle detail page', () => {
    const raffleId = '67ce4377c8559ed0be26a6ab'; // Use _id instead of id
    component.navigateToRaffleDetail(raffleId);
    expect(router.navigate).toHaveBeenCalledWith([`/raffle-detail/${raffleId}`]);
  });

  it('should navigate to raffle management page', () => {
    component.navigateToRaffleManagement();
    expect(router.navigate).toHaveBeenCalledWith(['/raffle-management']);
  });

  it('should toggle the sidebar', () => {
    expect(component.isSidebarOpen).toBeTrue(); // Initial state

    component.toggleSidebar();
    expect(component.isSidebarOpen).toBeFalse(); // Toggled state

    component.toggleSidebar();
    expect(component.isSidebarOpen).toBeTrue(); // Toggled back
  });
});
