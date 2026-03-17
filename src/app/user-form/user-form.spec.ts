import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';

import { UserForm } from './user-form';
import { UserService } from '../users/user.service';

describe('UserForm', () => {
  let component: UserForm;
  let fixture: ComponentFixture<UserForm>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', ['addUser', 'updateUser']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    userServiceSpy.addUser.and.returnValue(of({} as any));
    userServiceSpy.updateUser.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [UserForm],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
