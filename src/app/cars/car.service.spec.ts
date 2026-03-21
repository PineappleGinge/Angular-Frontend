import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { CarService } from './car.service';
import { Make, Color } from './car.interface';
import { environment } from '../../environments/environment';

describe('CarService', () => {
  let service: CarService;
  let httpMock: HttpTestingController;
  const carsUrl = `${environment.apiUri}/api/v1/cars`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CarService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should normalize year and imageUrl in getCars response', () => {
    let result: any[] = [];
    service.getCars().subscribe((cars) => {
      result = cars;
    });

    const req = httpMock.expectOne(carsUrl);
    expect(req.request.method).toBe('GET');
    req.flush([
      { _id: '1', make: Make.Ford, model: 'Mustang', color: Color.Black, yearOfCar: '1970', imageUrl: '  https://img  ' },
      { _id: '2', make: Make.BMW, model: '3 Series', color: Color.Blue, year: '2020-01-01T00:00:00.000Z', imageUrl: '' },
    ]);

    expect(result.length).toBe(2);
    expect(result[0].yearOfCar).toBe(1970);
    expect(result[0].imageUrl).toBe('https://img');
    expect(result[1].yearOfCar).toBe(2020);
    expect(result[1].imageUrl).toBeNull();
  });

  it('should send normalized payload in addCar', () => {
    service.addCar({
      make: Make.Opel,
      model: 'Astra',
      color: Color.Red,
      yearOfCar: 2021,
      imageUrl: '   ',
    } as any).subscribe();

    const req = httpMock.expectOne(carsUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.yearOfCar).toBe(2021);
    expect(req.request.body.year).toBe(2021);
    expect(req.request.body.imageUrl).toBeNull();
    req.flush({ _id: '1', make: Make.Opel, model: 'Astra', color: Color.Red, yearOfCar: 2021, imageUrl: null });
  });

  it('should map 401 to authorization error in deleteCar', () => {
    let errorMessage = '';
    service.deleteCar('1').subscribe({
      error: (err: Error) => {
        errorMessage = err.message;
      },
    });

    const req = httpMock.expectOne(`${carsUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(errorMessage).toBe('You are not authorised for that action');
  });
});
