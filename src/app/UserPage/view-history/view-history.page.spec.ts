import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewHistoryPage } from './view-history.page';

describe('ViewHistoryPage', () => {
  let component: ViewHistoryPage;
  let fixture: ComponentFixture<ViewHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
