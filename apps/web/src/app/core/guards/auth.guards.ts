import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSession } from '../services/auth-session';

/** Pages that need a logged-in user. Not logged in → /login. */
export const authGuard: CanActivateFn = () => {
  const session = inject(AuthSession);
  if (session.isLoggedIn()) return true;
  session.end(); // drop an expired token, if any
  return inject(Router).createUrlTree(['/login']);
};

/** Login/register pages. Already logged in → straight to the notebook. */
export const guestGuard: CanActivateFn = () =>
  inject(AuthSession).isLoggedIn() ? inject(Router).createUrlTree(['/notebook']) : true;
