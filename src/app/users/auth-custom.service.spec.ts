import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthCustomService } from './auth-custom.service';
import { environment } from '../../environments/environment';

describe('AuthCustomService', () => {
  let service: AuthCustomService;
  let httpMock: HttpTestingController;
  const authUrl = `${environment.apiUri}/api/v1/auth`;

  const createJwt = (exp: number): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ exp }));
    return `${header}.${payload}.sig`;
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    service = TestBed.inject(AuthCustomService);
    expect(service).toBeTruthy();
  });

  it('should log in and persist user and access token', () => {
    const jwt = createJwt(Math.floor(Date.now() / 1000) + 60 * 60);
    const user = { _id: 1, name: 'Test', email: 'test@example.com', phonenumber: '123' } as any;

    service = TestBed.inject(AuthCustomService);
    service.login('test@example.com', 'password123').subscribe();

    const req = httpMock.expectOne(authUrl);
    expect(req.request.method).toBe('POST');
    req.flush({ accessToken: jwt, user });

    expect(localStorage.getItem('accessToken')).toBe(jwt);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBe(JSON.stringify(user));
    expect(service.isAuthenticated$.value).toBeTrue();
    expect(service.currentUser$.value).toEqual(user);
  });

  it('should migrate legacy token to accessToken on initialization', () => {
    const jwt = createJwt(Math.floor(Date.now() / 1000) + 60 * 60);
    const storedUser = { _id: 1, name: 'Legacy User', email: 'legacy@example.com', phonenumber: '321' };

    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(storedUser));

    service = TestBed.inject(AuthCustomService);

    expect(localStorage.getItem('accessToken')).toBe(jwt);
    expect(localStorage.getItem('token')).toBeNull();
    expect(service.isAuthenticated$.value).toBeTrue();
    expect(service.currentUser$.value).toEqual(storedUser as any);
  });

  it('should clear stale session when token exists without valid user', () => {
    const jwt = createJwt(Math.floor(Date.now() / 1000) + 60 * 60);
    localStorage.setItem('accessToken', jwt);

    service = TestBed.inject(AuthCustomService);

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(service.isAuthenticated$.value).toBeFalse();
    expect(service.currentUser$.value).toBeNull();
  });

  it('should clear storage and auth state on logout', () => {
    const jwt = createJwt(Math.floor(Date.now() / 1000) + 60 * 60);
    localStorage.setItem('accessToken', jwt);
    localStorage.setItem('user', JSON.stringify({ _id: 1, name: 'User' }));

    service = TestBed.inject(AuthCustomService);
    service.logout();

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(service.currentUser$.value).toBeNull();
    expect(service.isAuthenticated$.value).toBeFalse();
  });
});
