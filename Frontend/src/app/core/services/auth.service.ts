import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { AuthResponse, User } from '@core/models/entities';
import { UserRole } from '@core/models/enums';

const TOKEN_KEY = 'dpscheck_token';
const USER_KEY = 'dpscheck_user';

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  // Signals d'état
  private readonly _token = signal<string | null>(this.readToken());
  private readonly _user = signal<User | null>(this.readUser());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly isPlayer = computed(() => this._user()?.role === UserRole.PLAYER);
  readonly isTO = computed(() => this._user()?.role === UserRole.TO);

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    if (this.hasLocalStorage()) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  private setSession(res: AuthResponse): void {
    this._token.set(res.accessToken);
    this._user.set(res.user);
    if (this.hasLocalStorage()) {
      localStorage.setItem(TOKEN_KEY, res.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
  }

  private readToken(): string | null {
    if (!this.hasLocalStorage()) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private readUser(): User | null {
    if (!this.hasLocalStorage()) return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private hasLocalStorage(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }
}
