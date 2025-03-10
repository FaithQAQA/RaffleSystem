import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let apiService: ApiService;
  let router: Router;
  let loginSpy: jasmine.Spy;
  let localStorageSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [ApiService]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    router = TestBed.inject(Router);
    loginSpy = spyOn(apiService, 'login');
    localStorageSpy = spyOn(localStorage, 'setItem');
  });

  describe('login', () => {
    it('should call apiService.login and navigate to dashboard on success', () => {
      const mockResponse = { token: 'dummyToken' };
      const email = 'test@example.com';
      const password = 'password123';

      // Mock the login method to return an observable
      loginSpy.and.returnValue(of(mockResponse));
      spyOn(router, 'navigate');

      component.email = email;
      component.password = password;
      component.login();

      expect(loginSpy).toHaveBeenCalledWith(email, password);
      expect(localStorageSpy).toHaveBeenCalledWith('adminToken', 'dummyToken');
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show alert on failed login', () => {
      const email = 'test@example.com';
      const password = 'wrongPassword';
      const mockError = { error: 'Invalid credentials' };

      // Mock the login method to return an observable with error
      loginSpy.and.returnValue(throwError(mockError));
      spyOn(window, 'alert');

      component.email = email;
      component.password = password;
      component.login();

      expect(loginSpy).toHaveBeenCalledWith(email, password);
      expect(window.alert).toHaveBeenCalledWith('Login failed');
    });

    it('should show invalid credentials alert when response does not contain a token', () => {
      const mockResponse = {}; // No token in the response
      const email = 'test@example.com';
      const password = 'password123';

      // Mock the login method to return an observable with the mock response
      loginSpy.and.returnValue(of(mockResponse));
      spyOn(window, 'alert');

      component.email = email;
      component.password = password;
      component.login();

      expect(loginSpy).toHaveBeenCalledWith(email, password);
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials!');
    });
  });

  describe('goToForgotPassword', () => {
    it('should navigate to forgot password page', () => {
      spyOn(router, 'navigate');

      component.goToForgotPassword();

      expect(router.navigate).toHaveBeenCalledWith(['/forget-password']);
    });
  });
});
