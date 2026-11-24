import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { SessionStore } from '../services/session-store';
import { authGuard } from './auth-guard';
import { authOnlyGuard } from './auth-only-guard';
import { guestGuard } from './guest-guard';
import { permissionGuard } from './permission-guard';

const state = { url: '/prestamos' } as RouterStateSnapshot;
const route = (permission?: string) =>
  ({ data: permission ? { permission } : {} }) as unknown as ActivatedRouteSnapshot;

describe('RBAC guards', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  const run = <T>(fn: () => T) => TestBed.runInInjectionContext(fn);
  const url = (result: unknown) => TestBed.inject(Router).serializeUrl(result as UrlTree);

  it('authGuard sends an anonymous user to /login with returnUrl', () => {
    expect(url(run(() => authGuard(route(), state)))).toBe('/login?returnUrl=%2Fprestamos');
  });

  it('guestGuard lets an anonymous user see /login and redirects an authenticated one', () => {
    expect(run(() => guestGuard(route(), state))).toBe(true);
    TestBed.inject(SessionStore).setTokens({
      access_token: 'a',
      refresh_token: 'r',
      token_type: 'Bearer',
      expires_in: 1,
      refresh_expires_in: 1,
    });
    expect(url(run(() => guestGuard(route(), state)))).toBe('/dashboard');
  });

  it('permissionGuard redirects to /forbidden with the missing permission', () => {
    expect(url(run(() => permissionGuard(route('GET /api/categorias'), state)))).toBe(
      '/forbidden?permission=GET%20%2Fapi%2Fcategorias',
    );
  });

  it('permissionGuard allows a granted permission', () => {
    TestBed.inject(SessionStore).setAccess({
      user: { id: 1, username: 'admin', email: 'a@x.com', avatar: null, status: 'active' },
      permissions: [
        {
          resource_id: 1,
          method: 'GET',
          path: '/api/categorias',
          description: null,
          role_id: 1,
          role_name: 'ADMIN',
        },
      ],
    });
    expect(run(() => permissionGuard(route('GET /api/categorias'), state))).toBe(true);
  });

  it('authOnlyGuard allows when auth is enabled (requireAuth = true)', () => {
    expect(TestBed.inject(SessionStore).authEnabled).toBe(true);
    expect(run(() => authOnlyGuard(route(), state))).toBe(true);
  });
});
