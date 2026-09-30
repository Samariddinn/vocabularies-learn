import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestApi } from './request-api';

/** What GET /users/me returns (the columns selected in UsersService.findById). */
export interface CurrentUser {
  id: string;
  login: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

/** Calls to the backend's /users endpoints. */
@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly requestApi = inject(RequestApi);

  /** The logged-in user. Needs a token — the auth interceptor adds it. */
  me(): Observable<CurrentUser> {
    return this.requestApi.get<CurrentUser>('users/me');
  }
}
