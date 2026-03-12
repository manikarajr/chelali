import { Injectable, signal, computed } from '@angular/core';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const AUTH_KEY = 'iceplant_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isLoggedIn = signal<boolean>(!!localStorage.getItem(AUTH_KEY));

  readonly isLoggedIn = computed(() => this._isLoggedIn());

  login(username: string, password: string): boolean {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, '1');
      this._isLoggedIn.set(true);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(AUTH_KEY);
    this._isLoggedIn.set(false);
  }

  getCredentialHint(): { username: string; password: string } {
    return { username: ADMIN_USERNAME, password: ADMIN_PASSWORD };
  }
}
