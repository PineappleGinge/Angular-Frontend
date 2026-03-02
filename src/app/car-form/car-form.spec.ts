import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarForm } from './car-form';

describe('CarForm', () => {
  let component: CarForm;
  let fixture: ComponentFixture<CarForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
