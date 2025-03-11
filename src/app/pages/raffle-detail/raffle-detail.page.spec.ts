import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RaffleDetailPage } from './raffle-detail.page';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastController } from '@ionic/angular';

describe('RaffleDetailPage', () => {
  let component: RaffleDetailPage;
  let fixture: ComponentFixture<RaffleDetailPage>;
  let apiService: ApiService;
  let router: Router;
  let toastController: ToastController;
  let getRaffleByIdSpy: jasmine.Spy;
  let presentToastSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RaffleDetailPage],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        ApiService,
        ToastController,
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
    toastController = TestBed.inject(ToastController);

    getRaffleByIdSpy = spyOn(apiService, 'getRaffleById');

    // Mocking ToastController create method
    presentToastSpy = spyOn(toastController, 'create').and.callFake(async (options) => {
      return {
        present: jasmine.createSpy('present')
      } as any;
    });

    spyOn(router, 'navigate');
  });

  describe('ngOnInit', () => {
    it('should fetch raffle details if raffleId is present', () => {
      const mockRaffle = { id: '123', name: 'Test Raffle' };
      getRaffleByIdSpy.and.returnValue(of(mockRaffle));

      component.ngOnInit();
      fixture.detectChanges();

      expect(getRaffleByIdSpy).toHaveBeenCalledWith('123');
      expect(component.raffle).toEqual(mockRaffle);
    });

    it('should navigate to error page if raffleId is missing', () => {
      (component as any).route.snapshot.paramMap.get = jasmine.createSpy().and.returnValue(null);
      component.ngOnInit();
      expect(router.navigate).toHaveBeenCalledWith(['/error-page']);
    });

    it('should show error toast if getRaffleById fails', async () => {
      getRaffleByIdSpy.and.returnValue(throwError(() => new Error('Failed to fetch raffle')));

      component.ngOnInit();
      fixture.detectChanges();

      expect(presentToastSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({ message: 'Error fetching raffle details', color: 'danger' })
      );
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
      spyOn(localStorage, 'removeItem');
      component.logout();
      expect(localStorage.removeItem).toHaveBeenCalledWith('adminToken');
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
