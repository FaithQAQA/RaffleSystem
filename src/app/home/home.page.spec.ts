import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HomePage } from './home.page';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // ✅ Import this
import { ApiService } from '../services/api.service'; // ✅ Import ApiService

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot(), HttpClientTestingModule], // ✅ Add HttpClientTestingModule
      providers: [ApiService], // ✅ Provide ApiService
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
