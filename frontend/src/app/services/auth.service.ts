import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Holds the current user state
  public currentUser$ = new BehaviorSubject<{
    role: string;
    username: string;
  } | null>(null);

  constructor() {
    const savedRole = localStorage.getItem('user_role');
    const savedName = localStorage.getItem('user_name');
    const token = localStorage.getItem('access_token');

    if (token && savedRole && savedName) {
      this.currentUser$.next({ role: savedRole, username: savedName });
    }
  }

  login(credentials: any) {
    return this.http.post<any>(
      'http://localhost:5000/api/auth/login',
      credentials
    );
  }

  handleLoginSuccess(response: any) {
    // Save "Badge" to browser storage
    localStorage.setItem('access_token', response.token);
    localStorage.setItem('user_role', response.role);
    localStorage.setItem('user_name', response.username);

    this.currentUser$.next({
      role: response.role,
      username: response.username,
    });
    this.router.navigate(['/dashboard']);
  }

  logout() {
    localStorage.clear();
    this.currentUser$.next(null);
    this.router.navigate(['/login']);
  }

  get isAdmin() {
    return this.currentUser$.value?.role === 'admin';
  }
}
