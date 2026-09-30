import { HttpErrorResponse } from '@angular/common/http';

/**
 * Turns an HTTP error from the /auth endpoints into a sentence for the user.
 * `byStatus` lets each page word the statuses it cares about (409, 401…).
 */
export function describeAuthError(
  error: HttpErrorResponse,
  byStatus: Partial<Record<number, string>> = {},
): string {
  const custom = byStatus[error.status];
  if (custom) return custom;

  switch (error.status) {
    case 0:
      return "Can't reach the server. Is the API running?";
    case 400: {
      // Nest's ValidationPipe sends { message: string[] }
      const message = error.error?.message;
      return Array.isArray(message) ? message.join(' ') : 'Check the fields and try again.';
    }
    default:
      return 'Something went wrong. Please try again.';
  }
}
