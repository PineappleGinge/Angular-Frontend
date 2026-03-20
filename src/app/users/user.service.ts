import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, retry, catchError, throwError } from 'rxjs';
import { User } from './user.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUri}/api/v1/users`;
  private gradeHistoryUri = `${environment.apiUri}/gradehistories`;

  private handleError = (error: unknown) => {
    if (!(error instanceof HttpErrorResponse)) {
      console.error('Unexpected error object:', error);
      return throwError(() => new Error('Something bad happened; please try again later.'));
    }

    const backendMessage =
      (typeof error.error === 'string' && error.error) ||
      (typeof error.error?.message === 'string' && error.error.message) ||
      '';

    if (error.status == 401 || error.status == 403) {
      console.log('authorisation issue ', error.status);
      return throwError(() => new Error(backendMessage || 'You are not authorised for that action'));
    }
    if (error.status === 0) {
      console.error('A client-side or network error occurred:', error.error);
    } else {
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => new Error(backendMessage || 'Something bad happened; please try again later.'));
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      catchError(this.handleError)
    );
  }

  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
      catchError(this.handleError)
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }
}
