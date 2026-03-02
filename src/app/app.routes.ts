import { Routes } from '@angular/router';
import { Users } from './users/users';
import { Home } from './home/home';
import { UserForm } from './user-form/user-form';
import { Cars } from './cars/cars';
import { CarForm } from './car-form/car-form';
import { LoginComponent } from './login/login';
import { authGuard } from './auth-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'car-list' },
  { path: 'home', component: Home },
  { path: 'user-list', component: Users, canActivate: [authGuard] },
  { path: 'userform', component: UserForm, canActivate: [authGuard] },
  {
    path: 'users/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./user-details/user-details').then((m) => m.UserDetails),
  },
  { path: 'car-list', component: Cars },
  { path: 'carform', component: CarForm, canActivate: [authGuard] },
  {
    path: 'cars/:id',
    loadComponent: () => import('./car-details/car-details').then((m) => m.CarDetails),
  },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'car-list' },
];
