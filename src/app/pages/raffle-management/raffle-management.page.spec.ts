import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RaffleManagementPage } from './raffle-management.page';

describe('RaffleManagementPage', () => {
  let component: RaffleManagementPage;
  let fixture: ComponentFixture<RaffleManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RaffleManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
