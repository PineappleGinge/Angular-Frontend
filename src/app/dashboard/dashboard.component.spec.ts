import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { StatsService } from '../stats.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let statsServiceSpy: jasmine.SpyObj<StatsService>;

  beforeEach(async () => {
    statsServiceSpy = jasmine.createSpyObj<StatsService>('StatsService', ['getStats']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: StatsService, useValue: statsServiceSpy }],
    }).compileComponents();
  });

  const createComponent = () => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should create', () => {
    statsServiceSpy.getStats.and.returnValue(of({}));
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should normalize array and object buckets on successful load', () => {
    statsServiceSpy.getStats.and.returnValue(
      of({
        totalCars: '4',
        totalUsers: 2,
        carsByMake: [{ _id: 'Ford', count: '3' }, { _id: null, count: 1 }],
        carsByColor: { Red: '2', Blue: 1 },
        carsByYear: [{ _id: 2020, count: '1' }],
        latestCars: [{ _id: 'c1', make: 'Ford', model: 'Focus' }],
      })
    );

    createComponent();

    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
    expect(component.stats).toEqual({
      totalCars: 4,
      totalUsers: 2,
      carsByMake: [{ label: 'Ford', count: 3 }],
      carsByColor: [
        { label: 'Red', count: 2 },
        { label: 'Blue', count: 1 },
      ],
      carsByYear: [{ label: '2020', count: 1 }],
      latestCars: [{ _id: 'c1', make: 'Ford', model: 'Focus' }],
    });
  });

  it('should map HttpErrorResponse backend message from error.message', () => {
    statsServiceSpy.getStats.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500, error: { message: 'Failed to load dashboard stats' } }))
    );

    createComponent();

    expect(component.loading).toBeFalse();
    expect(component.stats).toBeNull();
    expect(component.error).toBe('Failed to load dashboard stats');
  });

  it('should map unknown errors to generic dashboard message', () => {
    statsServiceSpy.getStats.and.returnValue(throwError(() => new Error('boom')));

    createComponent();

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('Failed to load dashboard stats.');
  });
});

