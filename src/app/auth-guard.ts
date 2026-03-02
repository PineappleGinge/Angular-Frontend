import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthCustomService } from './users/auth-custom.service';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthCustomService);
  const router = inject(Router);

  if (authService.isAuthenticated$.value) {
    return true;
  } else {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
};
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthCustomService);
  const router = inject(Router);

  if (authService.currentUser$.value?.role === 'admin') {
    return true;
  } else {
      return router.createUrlTree(['/login'], {
              queryParams: { returnUrl: state.url }});
  }
};
