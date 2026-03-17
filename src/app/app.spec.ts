import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { App } from './app';
import { UserService } from './users/user.service';
import { AuthCustomService } from './users/auth-custom.service';

describe('App', () => {
  const userServiceSpy = jasmine.createSpyObj<UserService>('UserService', ['getUsers']);
  const authServiceStub = {
    isAuthenticated$: new BehaviorSubject<boolean>(false),
  } as Partial<AuthCustomService>;

  beforeEach(async () => {
    userServiceSpy.getUsers.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthCustomService, useValue: authServiceStub },
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render navbar', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-navbar')).toBeTruthy();
  });
});
