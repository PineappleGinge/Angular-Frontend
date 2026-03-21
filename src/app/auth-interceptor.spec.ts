import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthInterceptor } from './auth-interceptor';
import { environment } from '../environments/environment';

describe('AuthInterceptor', () => {
  const apiUri = environment.apiUri;
  const runInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn) =>
    TestBed.runInInjectionContext(() => AuthInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    localStorage.clear();
  });

  it('should attach bearer token to non-auth API requests', () => {
    localStorage.setItem('accessToken', 'abc.def.ghi');
    const req = new HttpRequest('GET', `${apiUri}/api/v1/cars`);
    let capturedRequest: HttpRequest<unknown> | null = null;

    runInterceptor(req, (forwardedReq) => {
      capturedRequest = forwardedReq;
      return of(new HttpResponse({ status: 200 }));
    }).subscribe();

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.headers.get('Authorization')).toBe('Bearer abc.def.ghi');
  });

  it('should not attach token to auth endpoint requests', () => {
    localStorage.setItem('accessToken', 'abc.def.ghi');
    const req = new HttpRequest('POST', `${apiUri}/api/v1/auth`, {});
    let capturedRequest: HttpRequest<unknown> | null = null;

    runInterceptor(req, (forwardedReq) => {
      capturedRequest = forwardedReq;
      return of(new HttpResponse({ status: 200 }));
    }).subscribe();

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.headers.has('Authorization')).toBeFalse();
  });

  it('should not attach malformed bearer token', () => {
    localStorage.setItem('accessToken', 'not-a-jwt');
    const req = new HttpRequest('DELETE', `${apiUri}/api/v1/cars/1`);
    let capturedRequest: HttpRequest<unknown> | null = null;

    runInterceptor(req, (forwardedReq) => {
      capturedRequest = forwardedReq;
      return of(new HttpResponse({ status: 200 }));
    }).subscribe();

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.headers.has('Authorization')).toBeFalse();
  });

  it('should clear auth storage and redirect on 401 for non-auth endpoints', () => {
    localStorage.setItem('accessToken', 'abc.def.ghi');
    localStorage.setItem('user', '{"id":1}');
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const req = new HttpRequest('GET', `${apiUri}/api/v1/cars`);

    runInterceptor(req, () =>
      throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' }))
    ).subscribe({ error: () => undefined });

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should preserve auth storage and not redirect on 403 for non-auth endpoints', () => {
    localStorage.setItem('accessToken', 'abc.def.ghi');
    localStorage.setItem('user', '{"id":1}');
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const req = new HttpRequest('POST', `${apiUri}/api/v1/cars`, {});

    runInterceptor(req, () =>
      throwError(() => new HttpErrorResponse({ status: 403, statusText: 'Forbidden' }))
    ).subscribe({ error: () => undefined });

    expect(localStorage.getItem('accessToken')).toBe('abc.def.ghi');
    expect(localStorage.getItem('user')).toBe('{"id":1}');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
