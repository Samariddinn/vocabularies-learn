import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestApi } from './request-api';

/** Body for both /auth/register and /auth/login. */
export interface Credentials {
  login: string;
  password: string;
}

/** What POST /auth/register returns (the fields in the backend's `.returning([...])`). */
export interface RegisteredUser {
  id: string;
  login: string;
  role: 'user' | 'admin';
  created_at: string;
}

/**
 * What POST /auth/login is expected to return.
 * Adjust to match your backend once the login endpoint exists.
 */
export interface LoginResponse {
  accessToken: string;
}

/** Calls to the backend's /auth endpoints. */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly requestApi = inject(RequestApi);

  register(body: Credentials): Observable<RegisteredUser> {
    return this.requestApi.post<RegisteredUser>('auth/register', body);
  }

  login(body: Credentials): Observable<LoginResponse> {
    return this.requestApi.post<LoginResponse>('auth/login', body);
  }
}
