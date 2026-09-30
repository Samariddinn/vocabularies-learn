import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthApi } from '../../../core/services/auth-api';
import { AuthSession } from '../../../core/services/auth-session';
import { describeAuthError } from '../auth-errors';

/** Sign-in page: sends login + password to POST /auth/login. */
@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly authApi = inject(AuthApi);
  private readonly session = inject(AuthSession);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** Set when we arrive here right after creating an account (?registered=<login>). */
  protected readonly justRegistered = inject(ActivatedRoute).snapshot.queryParamMap.get('registered');

  private readonly loginInput = viewChild<ElementRef<HTMLInputElement>>('loginInput');
  private readonly passwordInput = viewChild<ElementRef<HTMLInputElement>>('passwordInput');

  protected readonly login = signal(this.justRegistered ?? '');
  protected readonly password = signal('');
  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly problem = signal<string | null>(null);

  protected readonly loginError = computed(() =>
    this.login().trim() ? null : 'Enter your login.',
  );
  protected readonly passwordError = computed(() =>
    this.password() ? null : 'Enter your password.',
  );

  constructor() {
    // Just registered → login is prefilled, so start in the password field.
    afterNextRender(() =>
      (this.justRegistered ? this.passwordInput() : this.loginInput())?.nativeElement.focus(),
    );
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (this.loginError() || this.passwordError() || this.submitting()) return;

    this.submitting.set(true);
    this.problem.set(null);

    this.authApi
      .login({ login: this.login().trim(), password: this.password() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ accessToken }) => {
          this.session.start(accessToken);
          this.router.navigate(['/notebook']);
        },
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          this.problem.set(
            describeAuthError(error, {
              401: 'Wrong login or password.',
              404: "The server doesn't have a login endpoint yet (POST /auth/login).",
            }),
          );
        },
      });
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
