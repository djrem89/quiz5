
import { Injectable, signal, computed } from '@angular/core';

interface User {
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Utenti hardcoded per la demo
  private readonly USERS = new Map<string, string>([
    ['user', 'password'],
    ['admin', 'admin'],
  ]);

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);

  login(username: string, password_raw: string): boolean {
    const expectedPassword = this.USERS.get(username);
    if (expectedPassword && expectedPassword === password_raw) {
      this.currentUser.set({ username });
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser.set(null);
  }
}
