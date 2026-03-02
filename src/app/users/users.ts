import { Component, inject } from '@angular/core';
import { UserService } from './user.service';
import { combineLatest, map, startWith } from 'rxjs';
import { User } from './user.interface';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthCustomService } from './auth-custom.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-users',
  imports: [AsyncPipe, RouterLink, MatButtonModule, MatCardModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  
  private service = inject(UserService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthCustomService);

  isAuthenciated$ = this.authService.isAuthenticated$;

  users$ = combineLatest([
    this.service.getUsers(),
    this.route.queryParamMap.pipe(
      map((params) => params.get('q') ?? ''),
      startWith('')
    ),
  ]).pipe(
    map(([users, term]) => {
      const t = term.toLowerCase();
      if (!t) return users;
      return users.filter((user) =>
        `${user.name} ${user._id}`.toLowerCase().includes(t)
      );
    })
  );

}
