import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterPage } from './register.page';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // ✅ Import this
import { ApiService } from 'src/services/api.service';
describe('RegisterPage', () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // ✅ Add this line
      declarations: [RegisterPage],
      providers: [ApiService], // ✅ Ensure ApiService is provided
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
