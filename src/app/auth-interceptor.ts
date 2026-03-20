import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const apiUri = `${environment.apiUri}`;
  const isApiRequest = req.url.startsWith(apiUri);
  const isAuthRequest = req.url.startsWith(`${apiUri}/api/v1/auth`);

  const rawToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
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

  const authRequest = isApiRequest && hasValidJwt && !isAuthRequest
    ? req.clone({ setHeaders: { Authorization: `Bearer ${jwt}` } })
    : req;

  return next(authRequest).pipe(
    catchError((err) => {
      const backendMessage =
        (typeof err?.error === 'string' && err.error) ||
        (typeof err?.error?.message === 'string' && err.error.message) ||
        err?.message ||
        'Request failed';

      console.error(`Request failed ${err?.status}: ${backendMessage}`);

      if (err?.status === 401 && !isAuthRequest) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }

      return throwError(() => err);
    })
  );
};
