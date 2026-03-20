import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login';
import { AuthCustomService } from '../users/auth-custom.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthCustomService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthCustomService>('AuthCustomService', ['login']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthCustomService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: { returnUrl: '/user-list' },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit credentials and navigate to returnUrl on success', () => {
    authServiceSpy.login.and.returnValue(of({ accessToken: 'a.b.c', user: {} as any }));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'secret123',
    });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith('test@example.com', 'secret123');
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/user-list');
  });

  it('should show backend error message on failed login', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 401, error: { message: 'Invalid login' } }))
    );
    spyOn(component, 'openErrorSnackBar');

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'secret123',
    });

    component.onSubmit();

    expect(component.openErrorSnackBar).toHaveBeenCalledWith('Invalid login');
  });
});
