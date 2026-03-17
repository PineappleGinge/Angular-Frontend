import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { provideRouter, Router, UrlTree } from '@angular/router';

import { adminGuard, authGuard } from './auth-guard';
import { AuthCustomService } from './users/auth-custom.service';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));
  const executeAdminGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => adminGuard(...guardParameters));

  const authServiceStub = {
    isAuthenticated$: new BehaviorSubject<boolean>(false),
    currentUser$: new BehaviorSubject<any>(null),
  };

  beforeEach(() => {
    authServiceStub.isAuthenticated$.next(false);
    authServiceStub.currentUser$.next(null);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthCustomService, useValue: authServiceStub },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow navigation when authenticated', () => {
    authServiceStub.isAuthenticated$.next(true);
    const result = executeGuard({} as any, { url: '/user-list' } as any);
    expect(result).toBeTrue();
  });

  it('should redirect to login with returnUrl when not authenticated', () => {
    authServiceStub.isAuthenticated$.next(false);
    const result = executeGuard({} as any, { url: '/user-list' } as any);
    const router = TestBed.inject(Router);
    expect(result instanceof UrlTree).toBeTrue();
    expect(router.serializeUrl(result as UrlTree)).toContain('/login');
    expect(router.serializeUrl(result as UrlTree)).toContain('returnUrl=%2Fuser-list');
  });

  it('should allow adminGuard when current user role is admin', () => {
    authServiceStub.currentUser$.next({ role: 'admin' });
    const result = executeAdminGuard({} as any, { url: '/user-list' } as any);
    expect(result).toBeTrue();
  });
});
