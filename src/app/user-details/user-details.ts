import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../users/user.service';
import { User } from '../users/user.interface';
import { Observable } from 'rxjs';
import { RouterModule, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import{UserForm} from '../user-form/user-form';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-user-details-component',
  imports: [RouterModule, AsyncPipe, RouterLink, CommonModule, UserForm, MatButtonModule],
  templateUrl: './user-details.html',
  styleUrl: './user-details.scss'
})
export class UserDetails {

  private route = inject(ActivatedRoute);
  private userService = inject (UserService);
  private router = inject(Router);
  public dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  id: string = "";
  user$ : Observable<User> | undefined

  ngOnInit(): void{
    this.id = this.route.snapshot.paramMap.get('id') || "";
    if (this.id) {
      this.user$ = this.userService.getUserById(this.id)
    }
  }

  deleteUser(): void {
    this.openConfirmDeleteDialog();
  }

  deleteItem(): void {
    if (this.id) {
      this.userService.deleteUser(this.id)
        .subscribe({
          next: () => this.router.navigateByUrl('/user-list'),
          error: (err: Error) => {
            this.openErrorSnackBar(err.message || 'Unable to delete the user.');
          }
        });
    }
  }

  openConfirmDeleteDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '450px',
      data: {
        title: 'Delete User',
        message: 'Are you sure you want to delete a user'
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
