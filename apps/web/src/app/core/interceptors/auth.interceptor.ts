import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthSession } from '../services/auth-session';

/**
 * Runs for every HttpClient request:
 *  1. adds `Authorization: Bearer <token>` to requests going to OUR API
 *     (never to other sites — the token must not leak to third parties);
 *  2. if our API answers 401 (token expired/invalid), logs out and goes to /login.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(environment.apiUrl)) return next(request);

  const session = inject(AuthSession);
  const router = inject(Router);
  const token = session.token();

  const withToken = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(withToken).pipe(
    catchError((error: unknown) => {
      const isAuthCall = request.url.includes('/auth/'); // a failed login is a 401 too
      if (error instanceof HttpErrorResponse && error.status === 401 && token && !isAuthCall) {
        session.end();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
