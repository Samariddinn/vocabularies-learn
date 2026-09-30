import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  // The app opens on the login page.
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Sign in · Vocabulary Notebook',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    title: 'Create an account · Vocabulary Notebook',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'notebook',
    canActivate: [authGuard],
    title: 'Vocabulary Notebook',
    loadComponent: () => import('./features/notebook/notebook').then((m) => m.Notebook),
  },
  // Unknown URLs go back to login.
  { path: '**', redirectTo: 'login' },
];
