import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ViewProductsPage } from './view-products.page';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('ViewProductsPage', () => {
  let component: ViewProductsPage;
  let fixture: ComponentFixture<ViewProductsPage>;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['getRaffleById']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = { snapshot: { paramMap: { get: () => '123' } } };

    apiServiceSpy.getRaffleById.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      declarations: [ViewProductsPage],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ApiService, useValue: apiServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();
  });


  beforeEach(() => {
    fixture = TestBed.createComponent(ViewProductsPage);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });





  it('should toggle showInfo', () => {
    expect(component.showInfo).toBeFalse();
    component.toggleInfo();
    expect(component.showInfo).toBeTrue();
  });




  it('should increase quantity', () => {
    expect(component.quantity).toBe(1);
    component.increaseQuantity();
    expect(component.quantity).toBe(2);
  });

  it('should decrease quantity', () => {
    component.quantity = 2;
    component.decreaseQuantity();
    expect(component.quantity).toBe(1);
  });

  it('should not decrease quantity below 1', () => {
    component.quantity = 1;
    component.decreaseQuantity();
    expect(component.quantity).toBe(1);
  });

  it('should log out and navigate to login page', () => {
    spyOn(localStorage, 'removeItem');

    component.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('adminToken');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });


});
