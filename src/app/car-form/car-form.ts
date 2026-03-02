import { Component, effect, inject, input } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarService } from '../cars/car.service';
import { Car, Color, Make } from '../cars/car.interface';

@Component({
  selector: 'app-car-form',
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './car-form.html',
  styleUrl: './car-form.scss',
})
export class CarForm {
  car = input<Car | undefined>();

  private fb = inject(FormBuilder);
  private carService = inject(CarService);
  private router = inject(Router);

  makes = Object.values(Make);
  colors = Object.values(Color);

  carForm = this.fb.group({
    make: ['', Validators.required],
    model: ['', [Validators.required, Validators.minLength(2)]],
    color: ['', Validators.required],
    yearOfCar: [
      null as number | null,
      [
        Validators.required,
        Validators.min(1900),
        Validators.max(new Date().getFullYear()),
      ],
    ],
  });

  constructor() {
    effect(() => {
      const c = this.car();
      if (c) {
        this.carForm.patchValue({
          make: c.make,
          model: c.model,
          color: c.color,
          yearOfCar: c.yearOfCar ?? c.year ?? null,
        });
      }
    });
  }

  get make() {
    return this.carForm.get('make');
  }

  get model() {
    return this.carForm.get('model');
  }

  get color() {
    return this.carForm.get('color');
  }

  get yearOfCar() {
    return this.carForm.get('yearOfCar');
  }

  onSubmit() {
    const value = this.carForm.value as Partial<Car>;

    if (value.yearOfCar !== undefined && value.yearOfCar !== null) {
      value.yearOfCar = Number(value.yearOfCar);
    }
    value.year = value.yearOfCar ?? null;

    if (!this.car()) {
      this.carService.addCar(value as Car).subscribe({
        next: () => this.router.navigateByUrl('/car-list'),
        error: (err: Error) => console.log(err.message),
      });
    } else {
      this.carService.updateCar(this.car()!._id!, value as Car).subscribe({
        next: () => this.router.navigateByUrl('/car-list'),
        error: (err: Error) => console.log(err.message),
      });
    }
  }
}
