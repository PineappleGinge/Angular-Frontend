import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CarService } from './car.service';
import { map } from 'rxjs';
import { Car } from './car.interface';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

type CarsState = {
  items: Car[];
  loading: boolean;
  error: string | null;
};

@Component({
  selector: 'app-cars',
  imports: [RouterLink],
  templateUrl: './cars.html',
  styleUrl: './cars.scss',
})
export class Cars {
  private destroyRef = inject(DestroyRef);
  private service = inject(CarService);
  private route = inject(ActivatedRoute);

  readonly carsState = signal<CarsState>({
    items: [],
    loading: true,
    error: null,
  });

  readonly searchTerm = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => params.get('q') ?? '')
    ),
    { initialValue: '' }
  );

  readonly filteredCars = computed(() => {
    const cars = this.carsState().items;
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return cars;
    }

    return cars.filter((car) =>
      `${car.make} ${car.model} ${car._id}`.toLowerCase().includes(term)
    );
  });

  constructor() {
    this.loadCars();
  }

  private loadCars() {
    this.carsState.update((state) => ({ ...state, loading: true, error: null }));
    this.service.getCars()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cars) => {
          this.carsState.set({
            items: cars,
            loading: false,
            error: null,
          });
        },
        error: (err: Error) => {
          this.carsState.update((state) => ({
            ...state,
            loading: false,
            error: err.message || 'Unable to load cars.',
          }));
        },
      });
  }
}
