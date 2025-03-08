import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RaffleDetailPage } from './raffle-detail.page';

describe('RaffleDetailPage', () => {
  let component: RaffleDetailPage;
  let fixture: ComponentFixture<RaffleDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RaffleDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
