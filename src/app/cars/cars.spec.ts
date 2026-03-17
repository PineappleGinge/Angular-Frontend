import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';

import { Cars } from './cars';
import { CarService } from './car.service';
import { Car, Color, Make } from './car.interface';

describe('Cars', () => {
  let component: Cars;
  let fixture: ComponentFixture<Cars>;
  let carServiceSpy: jasmine.SpyObj<CarService>;
  let queryParamMap$: Subject<ReturnType<typeof convertToParamMap>>;

  const mockCars: Car[] = [
    { _id: '1', make: Make.Ford, model: 'Mustang', color: Color.Black, yearOfCar: 1970 },
    { _id: '2', make: Make.Opel, model: 'Astra', color: Color.Blue, yearOfCar: 2020 },
  ];

  beforeEach(async () => {
    carServiceSpy = jasmine.createSpyObj<CarService>('CarService', ['getCars']);
    queryParamMap$ = new Subject<ReturnType<typeof convertToParamMap>>();
    carServiceSpy.getCars.and.returnValue(of(mockCars));

    await TestBed.configureTestingModule({
      imports: [Cars],
      providers: [
        { provide: CarService, useValue: carServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Cars);
    component = fixture.componentInstance;
    queryParamMap$.next(convertToParamMap({ q: '' }));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate carsState on successful load', () => {
    const state = component.carsState();
    expect(state.loading).toBeFalse();
    expect(state.error).toBeNull();
    expect(state.items.length).toBe(2);
  });

  it('should filter cars based on the query param', () => {
    queryParamMap$.next(convertToParamMap({ q: 'mustang' }));
    fixture.detectChanges();

    const filtered = component.filteredCars();
    expect(filtered.length).toBe(1);
    expect(filtered[0].model).toBe('Mustang');
  });

  it('should set error in carsState when loading fails', async () => {
    carServiceSpy.getCars.and.returnValue(throwError(() => new Error('Load failed')));

    const errorFixture = TestBed.createComponent(Cars);
    const errorComponent = errorFixture.componentInstance;
    queryParamMap$.next(convertToParamMap({ q: '' }));
    errorFixture.detectChanges();

    const state = errorComponent.carsState();
    expect(state.loading).toBeFalse();
    expect(state.error).toBe('Load failed');
  });
});
