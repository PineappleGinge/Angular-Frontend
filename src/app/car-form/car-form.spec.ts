import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';

import { CarForm } from './car-form';
import { CarService } from '../cars/car.service';
import { Color, Make } from '../cars/car.interface';

describe('CarForm', () => {
  let component: CarForm;
  let fixture: ComponentFixture<CarForm>;
  let carServiceSpy: jasmine.SpyObj<CarService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    carServiceSpy = jasmine.createSpyObj<CarService>('CarService', ['addCar', 'updateCar']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);

    carServiceSpy.addCar.and.returnValue(of({} as any));
    carServiceSpy.updateCar.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      imports: [CarForm],
      providers: [
        { provide: CarService, useValue: carServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CarForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose make-specific models through signal state', () => {
    component.make?.setValue(Make.Ford);
    fixture.detectChanges();

    expect(component.selectedMake()).toBe(Make.Ford);
    expect(component.availableModels()).toContain('Mustang');
    expect(component.availableModels()).toContain('Focus');
  });

  it('should clear selected model when make changes and model is invalid', () => {
    component.make?.setValue(Make.Ford);
    component.model?.setValue('Mustang');

    component.make?.setValue(Make.BMW);
    fixture.detectChanges();

    expect(component.model?.value).toBe('');
  });

  it('should submit normalized payload for create flow', () => {
    component.carForm.setValue({
      make: Make.Opel,
      model: 'Astra',
      color: Color.Black,
      yearOfCar: 2020,
      imageUrl: '   ',
    });

    component.onSubmit();

    expect(carServiceSpy.addCar).toHaveBeenCalled();
    const payload = carServiceSpy.addCar.calls.mostRecent().args[0] as any;
    expect(payload.yearOfCar).toBe(2020);
    expect(payload.year).toBe(2020);
    expect(payload.imageUrl).toBeNull();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/car-list');
  });
});
