import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { StatsService } from './stats.service';

describe('StatsService', () => {
  let service: StatsService;
  let httpMock: HttpTestingController;
  const statsUrl = 'https://bfqn19v948.execute-api.eu-west-1.amazonaws.com/prod/Stats';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(StatsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request dashboard stats from API gateway endpoint', () => {
    const mockResponse = { totalCars: 10, totalUsers: 5 };
    let response: any;

    service.getStats().subscribe((data) => {
      response = data;
    });

    const req = httpMock.expectOne(statsUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(response).toEqual(mockResponse);
  });
});

