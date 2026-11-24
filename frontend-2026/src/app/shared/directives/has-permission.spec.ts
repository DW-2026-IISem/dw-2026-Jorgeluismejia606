import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SessionStore } from '../../core/services/session-store';
import { HasPermission } from './has-permission';

@Component({
  imports: [HasPermission],
  template: `<ng-container *appHasPermission="'POST /api/prestamos'"
    ><button id="nuevo">Nuevo</button></ng-container
  >`,
})
class Host {}

describe('HasPermission', () => {
  beforeEach(() => localStorage.clear());

  it('creates and destroys the view when permissions change', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.querySelector('#nuevo')).toBeNull();

    const session = TestBed.inject(SessionStore);
    session.setAccess({
      user: { id: 2, username: 'bibliotecario', email: 'b@x.com', avatar: null, status: 'active' },
      permissions: [
        {
          resource_id: 24,
          method: 'POST',
          path: '/api/prestamos',
          description: null,
          role_id: 2,
          role_name: 'BIBLIOTECARIO',
        },
      ],
    });
    await fixture.whenStable();
    expect(html.querySelector('#nuevo')).toBeTruthy();

    session.clear();
    await fixture.whenStable();
    expect(html.querySelector('#nuevo')).toBeNull();
  });
});
