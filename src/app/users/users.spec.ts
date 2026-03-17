import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';

import { Users } from './users';
import { UserService } from './user.service';
import { AuthCustomService } from './auth-custom.service';

describe('Users', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', ['getUsers']);
    userServiceSpy.getUsers.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [Users],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthCustomService, useValue: { isAuthenticated$: new BehaviorSubject<boolean>(true) } },
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({ q: '' })) },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
