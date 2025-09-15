import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewRafflesPage } from './view-raffles.page';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // ✅ Import this
import { ApiService } from 'src/app/services/api.service';
describe('ViewRafflesPage', () => {
  let component: ViewRafflesPage;
  let fixture: ComponentFixture<ViewRafflesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewRafflesPage],
      imports: [HttpClientTestingModule], //  Provide HttpClient
      providers: [ApiService], //  Provide ApiService
    }).compileComponents();

    fixture = TestBed.createComponent(ViewRafflesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
