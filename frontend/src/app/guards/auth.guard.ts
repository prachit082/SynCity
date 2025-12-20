import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

// GUARD 1: Protects the Dashboard (Allow only if Logged In)
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.currentUser$.value) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

// GUARD 2: Protects the Login Page (Allow only if Logged OUT)
export const guestGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.currentUser$.value) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
