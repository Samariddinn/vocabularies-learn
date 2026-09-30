import { Injectable, computed, signal } from '@angular/core';

/** What the backend puts inside the JWT (see AuthService.login in the API). */
export interface TokenPayload {
  sub: string;
  login: string;
  role: 'user' | 'admin';
  /** Issued at — seconds since 1970. */
  iat: number;
  /** Expires at — seconds since 1970. */
  exp: number;
}

const TOKEN_KEY = 'vocab-access-token';

/**
 * Holds the logged-in user's access token.
 *
 * The token is kept in localStorage so a page reload doesn't log you out.
 * Trade-off: any script running on the page could read it (XSS). Once the
 * backend issues refresh tokens in an httpOnly cookie, this can move to memory only.
 */
@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly _token = signal<string | null>(readStoredToken());

  /** The raw JWT, or null when logged out. */
  readonly token = this._token.asReadonly();

  /** The decoded payload (login, role, expiry…), or null. Only for display — the server re-verifies. */
  readonly user = computed(() => {
    const token = this._token();
    return token ? decodePayload(token) : null;
  });

  /** True while we hold a token that hasn't expired yet. */
  isLoggedIn(): boolean {
    const user = this.user();
    return !!user && user.exp * 1000 > Date.now();
  }

  /** Call after a successful login. */
  start(token: string): void {
    this._token.set(token);
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // storage blocked (private mode…) — the session still works until reload
    }
  }

  /** Call on logout, or when the server says the token is no longer valid. */
  end(): void {
    this._token.set(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // nothing stored
    }
  }
}

function readStoredToken(): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Reads the middle part of a JWT (header.PAYLOAD.signature).
 * This does NOT check the signature — only the server can do that with its secret.
 */
function decodePayload(token: string): TokenPayload | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as TokenPayload;
  } catch {
    return null;
  }
}
