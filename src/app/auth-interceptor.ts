import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const apiUri = `${environment.apiUri}`;

  const rawToken = localStorage.getItem('token');
  const jwt = rawToken?.trim();
  const hasValidJwt =
    !!jwt &&
    jwt !== 'undefined' &&
    jwt !== 'null' &&
    jwt.split('.').length === 3;

  // we don't want to attach our token to a request to any other server
  // so we check that the request is to our own api
  // if so we create a new request with the Bearer token
  // if not we just copy the existing request.

  const authRequest = req.url.startsWith(apiUri) && hasValidJwt
    ? req.clone({ setHeaders: { Authorization: `Bearer ${jwt}` } })
    : req;

    return next(authRequest).pipe(
      catchError((err) => {
        console.log('Request failed ' + err.status);

        
      // Handle missing or invalid JWT (401 or 403)
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']); // Redirect to login page
      }

        return throwError(() => err);
      })
    );

}
