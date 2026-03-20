import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarService, VehicleValueResponse } from '../cars/car.service';
import { Car } from '../cars/car.interface';
import { Observable } from 'rxjs';
import { RouterModule, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import{CarForm} from '../car-form/car-form';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthCustomService } from '../users/auth-custom.service';


@Component({
  selector: 'app-car-details',
  imports: [RouterModule, AsyncPipe, RouterLink, CommonModule, CarForm, MatButtonModule],
  templateUrl: './car-details.html',
  styleUrl: './car-details.scss',
})
export class CarDetails {

  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private carService = inject(CarService);
  private authService = inject(AuthCustomService);
  private router = inject(Router);
  public dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);


  id: string = '';
  car$: Observable<Car> | undefined;
  isAuthenticated$ = this.authService.isAuthenticated$;
  isEditing = false;
  vehicleValueLoading = false;
  vehicleValueError: string | null = null;
  vehicleValueResponse: VehicleValueResponse | null = null;
  hasRequestedVehicleValue = false;

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (this.id) {
      this.car$ = this.carService.getCarById(this.id);
    }
  }

  deleteCar(): void {
    if (!this.authService.isAuthenticated$.value) {
      return;
    }
    this.openConfirmDeleteDialog();
  }

  toggleEdit(): void {
    if (!this.authService.isAuthenticated$.value) {
      return;
    }
    this.isEditing = !this.isEditing;
  }

  deleteItem(): void {
    if (!this.authService.isAuthenticated$.value) {
      return;
    }
    if (this.id) {
      this.carService.deleteCar(this.id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => this.router.navigateByUrl('/car-list'),
          error: (err: Error) => {
            this.openErrorSnackBar(err.message || 'Unable to delete the car.');
          }
        });
    }
  }

  openConfirmDeleteDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '450px',
      data: {
        title: 'Delete Car',
        message: 'Are you sure you want to delete a car'
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.deleteItem();
      }
    });

  }

  estimateValue(car: Car): void {
    const make = car.make?.trim();
    const model = car.model?.trim();
    const year = this.resolveYear(car);

    if (!make || !model || year === null) {
      this.vehicleValueError = 'Vehicle make, model, and year are required to estimate value.';
      this.vehicleValueResponse = null;
      this.hasRequestedVehicleValue = true;
      return;
    }

    this.vehicleValueLoading = true;
    this.vehicleValueError = null;
    this.vehicleValueResponse = null;
    this.hasRequestedVehicleValue = true;

    this.carService
      .getVehicleValue(make, model, year)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.vehicleValueResponse = response;
          this.vehicleValueLoading = false;
        },
        error: (err: Error) => {
          this.vehicleValueError = err.message || 'Unable to estimate vehicle value right now.';
          this.vehicleValueLoading = false;
        },
      });
  }

  get displayVehicleValue(): string | null {
    const value = this.extractValueCandidate(this.vehicleValueResponse);
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return this.formatCurrency(value);
    }

    if (typeof value === 'string') {
      const numeric = Number(value.replace(/[^0-9.-]/g, ''));
      if (Number.isFinite(numeric) && numeric > 0) {
        return this.formatCurrency(numeric);
      }
      return value;
    }

    return null;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  private extractValueCandidate(source: unknown): unknown {
    return this.findValueDeep(source);
  }

  private findValueDeep(node: unknown, depth = 0): unknown {
    if (node === null || node === undefined || depth > 8) {
      return null;
    }

    if (typeof node === 'number' || typeof node === 'string') {
      return null;
    }

    if (Array.isArray(node)) {
      for (const item of node) {
        const result = this.findValueDeep(item, depth + 1);
        if (result !== null && result !== undefined && result !== '') {
          return result;
        }
      }
      return null;
    }

    if (typeof node !== 'object') {
      return null;
    }

    const candidate = node as Record<string, unknown>;
    const directKeys = [
      'value',
      'price',
      'estimatedValue',
      'marketValue',
      'amount',
      'average',
      'mean',
      'msrp',
      'retail',
      'tradeIn',
      'listingPrice',
      'dealerPrice',
      'priceEstimate',
      'estimated_price',
    ];

    for (const key of directKeys) {
      const found = candidate[key];
      if (this.isPresentValue(found)) {
        return found;
      }
    }

    for (const [key, value] of Object.entries(candidate)) {
      if (/(price|value|msrp|retail|trade)/i.test(key) && this.isPresentValue(value)) {
        return value;
      }
    }

    for (const value of Object.values(candidate)) {
      const nested = this.findValueDeep(value, depth + 1);
      if (this.isPresentValue(nested)) {
        return nested;
      }
    }

    return null;
  }

  private isPresentValue(value: unknown): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  private resolveYear(car: Car): number | null {
    const rawYear = car.yearOfCar ?? car.year;
    if (typeof rawYear === 'number' && Number.isFinite(rawYear)) {
      return Math.trunc(rawYear);
    }

    if (typeof rawYear === 'string') {
      const parsed = Number(rawYear);
      return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
    }

    return null;
  }

  openErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 15000,
      panelClass: ['error-snackbar'],
    });
  }
}
