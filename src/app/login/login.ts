import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthCustomService } from '../users/auth-custom.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login.component',
  standalone: true,
  imports: [MatSnackBarModule, MatInputModule, ReactiveFormsModule, FormsModule, MatButtonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  returnUrl: string = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthCustomService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const values = this.loginForm.getRawValue();
    const email = values.email?.trim() ?? '';
    const password = values.password ?? '';

    console.log('submit with ');
    console.table(values);
    this.authService.login(email, password).
      subscribe({
        next: (response) => {
          console.log('user is logged in');
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (err: unknown) => {
          if (err instanceof HttpErrorResponse) {
            const backendMessage =
              (typeof err.error === 'string' && err.error) ||
              (typeof err.error?.message === 'string' && err.error.message) ||
              '';
            this.openErrorSnackBar(backendMessage || 'Unable to login. Please check your details.');
            console.log(err.message);
          } else {
            this.openErrorSnackBar('Unable to login. Please try again.');
            console.log('Unknown login error', err);
          }
        }

      });

  }

  get email() {
    return this.loginForm.get('email')?.value;
  }
  get password() {
    return this.loginForm.get('password')?.value;
  }

  openErrorSnackBar(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 15000, 
      panelClass: ['error-snackbar'], 
    });
  }

}
