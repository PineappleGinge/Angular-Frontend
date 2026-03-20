import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from './user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthCustomService {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly LEGACY_TOKEN_KEY = 'token';

  readonly currentUser$: BehaviorSubject<User | null>;
  readonly isAuthenticated$: BehaviorSubject<boolean>;

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUri}/api/v1/auth`;
  private authenticateTimeout?: ReturnType<typeof setTimeout>;

  constructor() {
    const initialUser = this.getStoredUser();
    this.currentUser$ = new BehaviorSubject<User | null>(initialUser);
    this.isAuthenticated$ = new BehaviorSubject<boolean>(false);

    const token = this.getStoredAccessToken();
    const expires = token ? this.getExpiryFromToken(token) : null;
    if (expires && expires > Date.now()) {
      this.isAuthenticated$.next(true);
      this.startAuthenticateTimer(expires);
    }
  }

  login(email: string, password: string) {
    return this.http
      .post<{ accessToken: string; user: User; token?: string }>(`${this.apiUrl}`, { email, password })
      .pipe(
        tap((response) => {
          const accessToken = response.accessToken || response.token || '';
          const { user } = response;
          localStorage.setItem(AuthCustomService.ACCESS_TOKEN_KEY, accessToken);
          localStorage.removeItem(AuthCustomService.LEGACY_TOKEN_KEY);
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUser$.next(user);
          this.isAuthenticated$.next(true);

          const expires = this.getExpiryFromToken(accessToken);
          if (expires) {
            this.startAuthenticateTimer(expires);
          }
        })
      );
  }

  public logout() {
    if (this.authenticateTimeout) {
      clearTimeout(this.authenticateTimeout);
      this.authenticateTimeout = undefined;
    }
    localStorage.removeItem('user');
    localStorage.removeItem(AuthCustomService.ACCESS_TOKEN_KEY);
    localStorage.removeItem(AuthCustomService.LEGACY_TOKEN_KEY);
    this.currentUser$.next(null);
    this.isAuthenticated$.next(false);
  }

  private startAuthenticateTimer(expires: number) {
    if (this.authenticateTimeout) {
      clearTimeout(this.authenticateTimeout);
    }

    const timeout = Math.max(expires - Date.now() - 60 * 1000, 0);

    this.authenticateTimeout = setTimeout(() => {
      if (this.isAuthenticated$.value) {
        this.logout();
      }
    }, timeout);
  }

  private getExpiryFromToken(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  }

  private getStoredAccessToken(): string {
    const accessToken = localStorage.getItem(AuthCustomService.ACCESS_TOKEN_KEY)?.trim();
    if (accessToken) {
      return accessToken;
    }

    const legacyToken = localStorage.getItem(AuthCustomService.LEGACY_TOKEN_KEY)?.trim();
    if (legacyToken) {
      localStorage.setItem(AuthCustomService.ACCESS_TOKEN_KEY, legacyToken);
      localStorage.removeItem(AuthCustomService.LEGACY_TOKEN_KEY);
      return legacyToken;
    }

    return '';
  }
}
