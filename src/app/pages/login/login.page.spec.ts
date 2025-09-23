import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastController } from '@ionic/angular';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let apiService: ApiService;
  let router: Router;
  let loginSpy: jasmine.Spy;
  let localStorageSpy: jasmine.Spy;
  let toastController: ToastController;
  let toastSpy: jasmine.SpyObj<HTMLIonToastElement>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService, ToastController],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    router = TestBed.inject(Router);
    toastController = TestBed.inject(ToastController);
    loginSpy = spyOn(apiService, 'login');
    localStorageSpy = spyOn(localStorage, 'setItem');

    // Spy on toast creation and presentation
    toastSpy = jasmine.createSpyObj('HTMLIonToastElement', ['present']);
    spyOn(toastController, 'create').and.returnValue(Promise.resolve(toastSpy));
  });



    it('should show toast on failed login', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';
      const mockError = { error: 'Invalid credentials' };

      loginSpy.and.returnValue(throwError(mockError));

      component.email = email;
      component.password = password;
      await component.login(); // Ensure async execution

      expect(loginSpy).toHaveBeenCalledWith(email, password);
      expect(toastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'An unexpected error occurred. Please try again.',
          duration: 3000,
          position: 'top',
          color: 'danger',
        })
      );

      expect(toastSpy.present).toHaveBeenCalled();
    });

    it('should show toast on failed login with invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';
      const mockError = { error: { type: 'credentials', message: 'Invalid email or password' } };

      loginSpy.and.returnValue(throwError(mockError));

      component.email = email;
      component.password = password;
      await component.login();

      expect(loginSpy).toHaveBeenCalledWith(email, password);
      expect(toastController.create).toHaveBeenCalledWith({
        message: 'Invalid email or password',
        duration: 3000,
        color: 'danger',
      });
      expect(toastSpy.present).toHaveBeenCalled();
    });

    it('should show toast on unexpected error', async () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';
      const mockError = { error: 'Some server error' };

      loginSpy.and.returnValue(throwError(mockError));

      component.email = email;
      component.password = password;
      await component.login();

      expect(loginSpy).toHaveBeenCalledWith(email, password);
      expect(toastController.create).toHaveBeenCalledWith(
        jasmine.objectContaining({
          message: 'An unexpected error occurred. Please try again.',
          duration: 3000,
          color: 'danger',
        })
      );
      expect(toastSpy.present).toHaveBeenCalled();
    });
  });



