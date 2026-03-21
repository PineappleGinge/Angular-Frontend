import { Component, inject, input, effect } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CreateUserRequest, UpdateUserRequest, User } from '../users/user.interface';
import { UserService } from '../users/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
})
export class UserForm {

  user = input<User | undefined>();

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  userName = new FormControl('Greetings');

  userForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phonenumber: [''],
    email: ['', [Validators.required, Validators.email]],
    dob: [''],
    dateJoined: [''],
    lastUpdated: [''],
  });

  constructor() {
    effect(() => {
      const u = this.user();
      if (u) {
        this.userForm.patchValue({
          name: u.name,
          phonenumber: u.phonenumber,
          email: u.email,
          dob: u.dob ? new Date(u.dob).toISOString().substring(0, 10) : '',
          dateJoined: u.dateJoined ? new Date(u.dateJoined).toISOString().substring(0, 10) : '',
          lastUpdated: u.lastUpdated ? new Date(u.lastUpdated).toISOString().substring(0, 10) : '',
        });
      }
    });
  }

  get name() {
    return this.userForm.get('name');
  }

  get dob(){
    return this.userForm.get('dob');
  }

  onSubmit(){
    const values = this.userForm.getRawValue();

    console.log('Form Submitted!');
    console.table(values);

    if (this.user()) {
      const updatePayload: UpdateUserRequest = {
        name: values.name?.trim() ?? '',
        email: values.email?.trim() ?? '',
        phonenumber: values.phonenumber?.trim() ?? '',
        dob: values.dob ?? '',
      };

      this.userService.updateUser(String(this.user()!._id), updatePayload)
        .subscribe({
          next: () => this.router.navigateByUrl('/user-list'),
          error: (err: Error) => console.log(err.message)
        });
    } else {
      const createPayload: CreateUserRequest = {
        name: values.name?.trim() ?? '',
        email: values.email?.trim() ?? '',
        phonenumber: values.phonenumber?.trim() ?? '',
        dob: values.dob ?? '',
        password: 'TempPass123!',
      };

      this.userService.createUser(createPayload)
      .subscribe({
        next: () => this.router.navigateByUrl('/user-list'),
        error: (err: Error) => console.log(err.message)
      });
    }
  }

  updateName(){
    this.userName.setValue(this.userName.value + 'is awesome!');
  }
}
