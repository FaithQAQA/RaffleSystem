import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewRafflesPage } from './view-raffles.page';

describe('ViewRafflesPage', () => {
  let component: ViewRafflesPage;
  let fixture: ComponentFixture<ViewRafflesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRafflesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
