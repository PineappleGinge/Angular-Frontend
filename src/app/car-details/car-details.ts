import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarService } from '../cars/car.service';
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


@Component({
  selector: 'app-car-details',
  imports: [RouterModule, AsyncPipe, RouterLink, CommonModule, CarForm, MatButtonModule],
  templateUrl: './car-details.html',
  styleUrl: './car-details.scss',
})
export class CarDetails {

  private route = inject(ActivatedRoute);
  private carService = inject(CarService)
  private router = inject(Router);
  public dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);


  id: string = ""
  car$ : Observable<Car> | undefined

  ngOnInit(): void{
    this.id = this.route.snapshot.paramMap.get('id') || "";
    if (this.id) {
      this.car$ = this.carService.getCarById(this.id)
    } 
  }

  deleteCar(): void {
    this.openConfirmDeleteDialog();
  }

  deleteItem(): void {
    if (this.id) {
      this.carService.deleteCar(this.id)
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

  openErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 15000,
      panelClass: ['error-snackbar'],
    });
  }
}
