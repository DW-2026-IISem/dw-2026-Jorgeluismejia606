import { TestBed } from '@angular/core/testing';
import { EffectivePermission } from '../models/auth.model';
import { SessionStore, STORAGE_KEY, pathMatches } from './session-store';

function permiso(method: string, path: string, role = 'BIBLIOTECARIO'): EffectivePermission {
  return {
    resource_id: 1,
    method: method as 'GET',
    path,
    description: null,
    role_id: 2,
    role_name: role,
  };
}

describe('SessionStore', () => {
  beforeEach(() => localStorage.clear());

  function store(): SessionStore {
    return TestBed.inject(SessionStore);
  }

  it('matches :id patterns but not extra segments', () => {
    expect(pathMatches('/api/usuarios/:id', '/api/usuarios/7')).toBe(true);
    expect(pathMatches('/api/usuarios/:id', '/api/usuarios/7/permisos')).toBe(false);
    expect(pathMatches('/api/libros', '/api/libros-falsos')).toBe(false);
  });

  it('denies by default and grants exact permissions', () => {
    const session = store();
    session.setAccess({
      user: { id: 2, username: 'bibliotecario', email: 'b@x.com', avatar: null, status: 'active' },
      permissions: [permiso('GET', '/api/lectores'), permiso('GET', '/api/lectores/:id')],
    });
    expect(session.canPermission('GET /api/lectores')).toBe(true);
    expect(session.canPermission('GET /api/lectores/5')).toBe(true);
    expect(session.canPermission('POST /api/lectores')).toBe(false);
    expect(session.roleNames()).toEqual(['BIBLIOTECARIO']);
  });

  it('persists and clears the session in localStorage', () => {
    const session = store();
    session.setTokens({
      access_token: 'a',
      refresh_token: 'r',
      token_type: 'Bearer',
      expires_in: 900,
      refresh_expires_in: 1,
    });
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).accessToken).toBe('a');
    expect(session.isAuthenticated()).toBe(true);
    session.clear();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(session.isAuthenticated()).toBe(false);
  });
});
