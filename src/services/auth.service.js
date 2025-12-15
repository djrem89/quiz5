import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Utenti hardcoded per la demo
  private readonly USERS = new Map([
    ['user', 'password'],
    ['admin', 'admin'],
  ]);

  currentUser = signal(null);
  isAuthenticated = computed(() => this.currentUser() !== null);

  login(username, password_raw) {
    const expectedPassword = this.USERS.get(username);
    if (expectedPassword && expectedPassword === password_raw) {
      this.currentUser.set({ username });
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
  }
}