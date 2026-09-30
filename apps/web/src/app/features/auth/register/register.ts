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
import { Router, RouterLink } from '@angular/router';
import { AuthApi } from '../../../core/services/auth-api';
import { describeAuthError } from '../auth-errors';

/** Sign-up page: sends login + password to POST /auth/register. */
@Component({
  selector: 'app-register',
  imports: [RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly loginInput = viewChild<ElementRef<HTMLInputElement>>('loginInput');

  protected readonly login = signal('');
  protected readonly password = signal('');
  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly problem = signal<string | null>(null);

  // Same rules as the backend's RegisterDto, checked here too so the user gets
  // instant feedback. The backend still validates — never trust the client alone.
  protected readonly loginError = computed(() => {
    const length = this.login().trim().length;
    return length < 3 || length > 40 ? 'Login must be 3–40 characters.' : null;
  });
  protected readonly passwordError = computed(() =>
    this.password().length < 8 ? 'Password must be at least 8 characters.' : null,
  );

  constructor() {
    afterNextRender(() => this.loginInput()?.nativeElement.focus());
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (this.loginError() || this.passwordError() || this.submitting()) return;

    const login = this.login().trim();
    this.submitting.set(true);
    this.problem.set(null);

    this.authApi
      .register({ login, password: this.password() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        // Account created → go to the login page, with the login filled in.
        next: () =>
          this.router.navigate(['/login'], { queryParams: { registered: login.toLowerCase() } }),
        error: (error: HttpErrorResponse) => {
          this.submitting.set(false);
          this.problem.set(
            describeAuthError(error, { 409: 'That login is already taken. Try another one.' }),
          );
        },
      });
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
}
