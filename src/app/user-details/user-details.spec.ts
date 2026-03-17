import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UserDetails } from './user-details';
import { UserService } from '../users/user.service';

describe('UserDetails', () => {
  let component: UserDetails;
  let fixture: ComponentFixture<UserDetails>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', ['getUserById', 'deleteUser']);
    userServiceSpy.getUserById.and.returnValue(of({ _id: '1', name: 'Test User' } as any));
    userServiceSpy.deleteUser.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [UserDetails],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
        },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigateByUrl']) },
        {
          provide: MatDialog,
          useValue: { open: () => ({ afterClosed: () => of(false) }) },
        },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']) },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDetails);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete and navigate when delete succeeds', () => {
    component.id = '1';
    component.deleteItem();
    expect(userServiceSpy.deleteUser).toHaveBeenCalledWith('1');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/user-list');
  });

  it('should show snackbar when delete fails', () => {
    userServiceSpy.deleteUser.and.returnValue(throwError(() => new Error('Delete failed')));
    spyOn(component, 'openErrorSnackBar');
    component.id = '1';
    component.deleteItem();
    expect(component.openErrorSnackBar).toHaveBeenCalledWith('Delete failed');
  });

  it('should call deleteItem when dialog confirms', () => {
    const dialog = TestBed.inject(MatDialog);
    spyOn(dialog, 'open').and.returnValue({
      afterClosed: () => of(true),
    } as any);
    spyOn(component, 'deleteItem');
    component.openConfirmDeleteDialog();
    expect(component.deleteItem).toHaveBeenCalled();
  });
});
