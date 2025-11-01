import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LiveRafflePage } from './live-raffle.page';

describe('LiveRafflePage', () => {
  let component: LiveRafflePage;
  let fixture: ComponentFixture<LiveRafflePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveRafflePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
