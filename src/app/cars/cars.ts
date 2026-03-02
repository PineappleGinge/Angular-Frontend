import { Component, inject } from '@angular/core';
import { CarService } from './car.service';
import { combineLatest, map, startWith } from 'rxjs';
import { Car } from './car.interface';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-cars',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './cars.html',
  styleUrl: './cars.scss',
})
export class Cars {

  private service = inject(CarService);
  private route = inject(ActivatedRoute);

  cars$ = combineLatest([
    this.service.getCars(),
    this.route.queryParamMap.pipe(
      map((params) => params.get('q') ?? ''),
      startWith('')
    ),
  ]).pipe(
    map(([cars, term]) => {
      const t = term.toLowerCase();
      if (!t) return cars;
      return cars.filter((car) =>
        `${car.make} ${car.model} ${car._id}`.toLowerCase().includes(t)
      );
    })
  );
}
