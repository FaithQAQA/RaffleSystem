import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewCartPage } from './view-cart.page';

describe('ViewCartPage', () => {
  let component: ViewCartPage;
  let fixture: ComponentFixture<ViewCartPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
