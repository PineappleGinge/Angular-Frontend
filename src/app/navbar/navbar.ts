import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthCustomService } from '../users/auth-custom.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, FormsModule, AsyncPipe, NgIf],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private router = inject(Router);
  private authService = inject(AuthCustomService);

  isAuthenticated$ = this.authService.isAuthenticated$;

  entity: 'cars' | 'users' = 'cars';
  query = '';

  onSearch() {
    const term = this.query.trim();
    const isAuthenticated = this.authService.isAuthenticated$.value;

    if (!isAuthenticated && this.entity === 'users') {
      this.entity = 'cars';
    }

    const target = this.entity === 'cars' ? '/car-list' : '/user-list';

    if (!term) {
      this.router.navigateByUrl(target);
      return;
    }

    this.router.navigate([target], { queryParams: { q: term } });
  }
}
