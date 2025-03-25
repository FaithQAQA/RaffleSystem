import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPage } from './landing.page';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // ✅ Import this
import { ApiService } from 'src/services/api.service';
describe('LandingPage', () => {
  let component: LandingPage;
  let fixture: ComponentFixture<LandingPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LandingPage],
      imports: [HttpClientTestingModule], // ✅ Add HttpClientTestingModule
      providers: [ApiService], // ✅ Provide ApiService
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
