import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, retry, catchError, throwError, map } from 'rxjs';
import { Car } from './car.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CarService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUri}/api/v1/cars`;

  private normalizeCar(car: Car): Car {
    const normalizedYear = car.yearOfCar ?? car.year ?? null;
    return {
      ...car,
      yearOfCar: normalizedYear,
      year: normalizedYear,
    };
  }

  private toApiCar(car: Car): Car {
    const normalizedYear = car.yearOfCar ?? car.year ?? null;
    return {
      ...car,
      yearOfCar: normalizedYear,
      year: normalizedYear,
    };
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('A client-side or network error occurred:', error.error);
    } else {
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }

  getCars(): Observable<Car[]> {
    return this.http.get<Car[]>(this.apiUrl).pipe(
      retry(3),
      map((cars) => cars.map((car) => this.normalizeCar(car))),
      catchError(this.handleError)
    );
  }

  getCarById(id: string): Observable<Car> {
    return this.http.get<Car>(`${this.apiUrl}/${id}`).pipe(
      map((car) => this.normalizeCar(car)),
      catchError(this.handleError)
    );
  }

  addCar(car: Car): Observable<Car> {
    return this.http.post<Car>(this.apiUrl, this.toApiCar(car)).pipe(
      map((savedCar) => this.normalizeCar(savedCar)),
      catchError(this.handleError)
    );
  }

  updateCar(id: string, car: Car): Observable<Car> {
    return this.http.put<Car>(`${this.apiUrl}/${id}`, this.toApiCar(car)).pipe(
      map((savedCar) => this.normalizeCar(savedCar)),
      catchError(this.handleError)
    );
  }

  deleteCar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}
