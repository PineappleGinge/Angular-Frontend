import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { CarDetails } from './car-details';
import { CarService } from '../cars/car.service';
import { AuthCustomService } from '../users/auth-custom.service';

describe('CarDetails', () => {
  let component: CarDetails;
  let fixture: ComponentFixture<CarDetails>;
  let carServiceSpy: jasmine.SpyObj<CarService>;
  let router: Router;
  let authServiceStub: { isAuthenticated$: BehaviorSubject<boolean> };

  beforeEach(async () => {
    authServiceStub = {
      isAuthenticated$: new BehaviorSubject<boolean>(true),
    };

    carServiceSpy = jasmine.createSpyObj<CarService>('CarService', ['getCarById', 'deleteCar', 'getVehicleValue']);
    carServiceSpy.getCarById.and.returnValue(of({ _id: '1', make: 'Ford', model: 'Mustang' } as any));
    carServiceSpy.deleteCar.and.returnValue(of(void 0));
    carServiceSpy.getVehicleValue.and.returnValue(of({ value: 12000 } as any));

    await TestBed.configureTestingModule({
      imports: [CarDetails],
      providers: [
        { provide: CarService, useValue: carServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } },
        },
        {
          provide: MatDialog,
          useValue: { open: () => ({ afterClosed: () => of(false) }) },
        },
        { provide: MatSnackBar, useValue: jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']) },
        { provide: AuthCustomService, useValue: authServiceStub },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarDetails);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle editing mode', () => {
    expect(component.isEditing).toBeFalse();
    component.toggleEdit();
    expect(component.isEditing).toBeTrue();
    component.toggleEdit();
    expect(component.isEditing).toBeFalse();
  });

  it('should delete and navigate when delete succeeds', () => {
    spyOn(router, 'navigateByUrl').and.stub();
    component.id = '1';
    component.deleteItem();
    expect(carServiceSpy.deleteCar).toHaveBeenCalledWith('1');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/car-list');
  });

  it('should show snackbar when delete fails', () => {
    carServiceSpy.deleteCar.and.returnValue(throwError(() => new Error('Delete failed')));
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

  it('should not toggle edit mode when unauthenticated', () => {
    authServiceStub.isAuthenticated$.next(false);
    component.isEditing = false;

    component.toggleEdit();

    expect(component.isEditing).toBeFalse();
  });

  it('should not delete when unauthenticated', () => {
    authServiceStub.isAuthenticated$.next(false);
    component.id = '1';

    component.deleteItem();

    expect(carServiceSpy.deleteCar).not.toHaveBeenCalled();
  });

  it('should show validation error when estimate value is requested with missing fields', () => {
    component.estimateValue({ make: '', model: 'Focus', yearOfCar: 2020 } as any);

    expect(component.vehicleValueResponse).toBeNull();
    expect(component.hasRequestedVehicleValue).toBeTrue();
    expect(component.vehicleValueError).toContain('required');
  });

  it('should request vehicle value and format numeric value', () => {
    carServiceSpy.getVehicleValue.and.returnValue(of({ nested: { marketValue: '24500' } } as any));

    component.estimateValue({ make: 'Ford', model: 'Focus', yearOfCar: '2020' as any } as any);

    expect(carServiceSpy.getVehicleValue).toHaveBeenCalledWith('Ford', 'Focus', 2020);
    expect(component.vehicleValueLoading).toBeFalse();
    expect(component.vehicleValueError).toBeNull();
    expect(component.displayVehicleValue).toContain('$24,500');
  });

  it('should set estimate error message when vehicle value request fails', () => {
    carServiceSpy.getVehicleValue.and.returnValue(throwError(() => new Error('Estimator offline')));

    component.estimateValue({ make: 'Ford', model: 'Focus', yearOfCar: 2020 } as any);

    expect(component.vehicleValueLoading).toBeFalse();
    expect(component.vehicleValueError).toBe('Estimator offline');
  });
});
