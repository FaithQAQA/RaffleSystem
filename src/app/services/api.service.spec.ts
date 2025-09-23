import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });




  describe('login', () => {
    it('should send a POST request to login and store token', () => {
      const mockResponse = { token: 'dummyToken' };
      const email = 'test@example.com';
      const password = 'password123';

      spyOn(localStorage, 'setItem');

      service.login(email, password).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'dummyToken');
      });

      const req = httpMock.expectOne(`${service['baseUrl']}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, password });
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should send a POST request to register a new user', () => {
      const mockResponse = { message: 'User registered successfully' };
      const username = 'testUser';
      const email = 'test@example.com';
      const password = 'password123';

      service.register(username, email, password).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${service['baseUrl']}/auth/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username, email, password });
      req.flush(mockResponse);
    });
  });

  describe('createRaffle', () => {
    it('should send a POST request to create a raffle with the correct headers', () => {
      const mockResponse = { success: true };
      const raffleData = { title: 'Test Raffle', ticketPrice: 10 };

      spyOn(localStorage, 'getItem').and.returnValue('dummyToken');

      service.createRaffle(raffleData).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${service['baseUrl']}/raffles`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(raffleData);
      expect(req.request.headers.has('Authorization')).toBeTrue();
      req.flush(mockResponse);
    });
  });

  describe('getAllRaffles', () => {
    it('should send a GET request to fetch all raffles with the correct headers', () => {
      const mockResponse = [{ title: 'Test Raffle 1' }, { title: 'Test Raffle 2' }];

      spyOn(localStorage, 'getItem').and.returnValue('dummyToken');

      service.getAllRaffles().subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${service['baseUrl']}/raffles`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Authorization')).toBeTrue();
      req.flush(mockResponse);
    });
  });

  describe('getRaffleById', () => {
    it('should send a GET request to fetch a raffle by ID with the correct headers', () => {
      const mockResponse = { title: 'Test Raffle' };
      const raffleId = '123';

      spyOn(localStorage, 'getItem').and.returnValue('dummyToken');

      service.getRaffleById(raffleId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${service['baseUrl']}/raffles/${raffleId}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.has('Authorization')).toBeTrue();
      req.flush(mockResponse);
    });
  });

  describe('updateRaffle', () => {
    it('should send a PUT request to update a raffle with the correct headers', () => {
      const mockResponse = { success: true };
      const raffleData = { title: 'Updated Raffle' };
      const raffleId = '123';

      spyOn(localStorage, 'getItem').and.returnValue('dummyToken');

      service.updateRaffle(raffleId, raffleData).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${service['baseUrl']}/raffles/${raffleId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(raffleData);
      expect(req.request.headers.has('Authorization')).toBeTrue();
      req.flush(mockResponse);
    });
  });

  describe('deleteRaffle', () => {
    it('should send a DELETE request to delete a raffle with the correct headers', () => {
      const mockResponse = { success: true };
      const raffleId = '123';

      spyOn(localStorage, 'getItem').and.returnValue('dummyToken');

      service.deleteRaffle(raffleId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${service['baseUrl']}/raffles/${raffleId}`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.has('Authorization')).toBeTrue();
      req.flush(mockResponse);
    });
  });
});
