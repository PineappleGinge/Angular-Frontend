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

  private parseYear(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.trunc(value);
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.getFullYear();
    }

    if (typeof value === 'string') {
      const numeric = Number(value);
      if (Number.isFinite(numeric)) {
        return Math.trunc(numeric);
      }

      const parsedDate = new Date(value);
      if (!Number.isNaN(parsedDate.getTime())) {
        return parsedDate.getFullYear();
      }
    }

    return null;
  }

  private normalizeImageUrl(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private normalizeCar(car: Car): Car {
    const normalizedYear = this.parseYear(car.yearOfCar) ?? this.parseYear(car.year);
    return {
      ...car,
      yearOfCar: normalizedYear,
      year: normalizedYear,
      imageUrl: this.normalizeImageUrl(car.imageUrl),
    };
  }

  private toApiCar(car: Car): Car {
    const normalizedYear = this.parseYear(car.yearOfCar) ?? this.parseYear(car.year);
    return {
      ...car,
      yearOfCar: normalizedYear,
      year: normalizedYear,
      imageUrl: this.normalizeImageUrl(car.imageUrl),
    };
  }

  private handleError(error: HttpErrorResponse) {
    const backendMessage =
      (typeof error.error === 'string' && error.error) ||
      (typeof error.error?.message === 'string' && error.error.message) ||
      '';

    if (error.status === 401 || error.status === 403) {
      return throwError(() => new Error(backendMessage || 'You are not authorised for that action'));
    }

    if (error.status === 0) {
      console.error('A client-side or network error occurred:', error.error);
    } else {
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => new Error(backendMessage || 'Something bad happened; please try again later.'));
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
