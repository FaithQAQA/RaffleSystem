import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RaffleDetailPage } from './raffle-detail.page';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';

describe('RaffleDetailPage', () => {
  let component: RaffleDetailPage;
  let fixture: ComponentFixture<RaffleDetailPage>;
  let apiService: ApiService;
  let router: Router;
  let location: Location;
  let activatedRoute: ActivatedRoute;
  let getRaffleByIdSpy: jasmine.Spy;
  let updateRaffleSpy: jasmine.Spy;
  let deleteRaffleSpy: jasmine.Spy;
  let localStorageSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RaffleDetailPage],
      imports: [HttpClientTestingModule, RouterTestingModule, ],
      providers: [
        ApiService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: (key: string) => '123' } }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RaffleDetailPage);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    activatedRoute = TestBed.inject(ActivatedRoute);

    // Spying on API calls
    getRaffleByIdSpy = spyOn(apiService, 'getRaffleById');
    updateRaffleSpy = spyOn(apiService, 'updateRaffle');
    deleteRaffleSpy = spyOn(apiService, 'deleteRaffle');

    // Spying on router navigation
    spyOn(router, 'navigate');

    // Mocking localStorage methods
    localStorageSpy = spyOn(localStorage, 'removeItem');
  });

  describe('ngOnInit', () => {
    it('should fetch raffle details if raffleId is present', () => {
      const mockRaffle = { id: '123', name: 'Test Raffle' };

      getRaffleByIdSpy.and.returnValue(of(mockRaffle));

      component.ngOnInit();

      expect(getRaffleByIdSpy).toHaveBeenCalledWith('123');
      expect(component.raffle).toEqual(mockRaffle);
    });

    it('should navigate to error page if raffleId is missing', () => {
      const mockRaffleId = null;
      activatedRoute.snapshot.paramMap.get = jasmine.createSpy().and.returnValue(mockRaffleId);

      component.ngOnInit();

      expect(router.navigate).toHaveBeenCalledWith(['/error-page']);
    });

    it('should show error alert if getRaffleById fails', () => {
      const mockError = { error: 'Failed to fetch raffle' };
      const spyAlert = spyOn(window, 'alert');

      getRaffleByIdSpy.and.returnValue(throwError(mockError));

      component.ngOnInit();

      expect(spyAlert).toHaveBeenCalledWith('Error fetching raffle details');
    });
  });


  describe('toggleSidebar', () => {
    it('should toggle sidebar state', () => {
      expect(component.isSidebarOpen).toBe(true);
      component.toggleSidebar();
      expect(component.isSidebarOpen).toBe(false);
    });
  });

  describe('logout', () => {
    it('should remove token from localStorage and navigate to login', () => {
      component.logout();
      expect(localStorageSpy).toHaveBeenCalledWith('adminToken');
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('navigateToCreateRaffle', () => {
    it('should navigate to create raffle page', () => {
      component.navigateToCreateRaffle();
      expect(router.navigate).toHaveBeenCalledWith(['/create-raffle']);
    });
  });

  describe('navigateToRaffleDetail', () => {
    it('should navigate to raffle detail page with correct raffleId', () => {
      const raffleId = 123;
      component.navigateToRaffleDetail(raffleId);
      expect(router.navigate).toHaveBeenCalledWith([`/raffle-detail/${raffleId}`]);
    });
  });

  describe('navigateToRaffleManagement', () => {
    it('should navigate to raffle management page', () => {
      component.navigateToRaffleManagement();
      expect(router.navigate).toHaveBeenCalledWith(['/raffle-management']);
    });
  });
});
