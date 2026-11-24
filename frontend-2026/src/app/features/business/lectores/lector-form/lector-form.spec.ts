import { TestBed } from '@angular/core/testing';
import { Lector, LectorPayload } from '../lector.model';
import { LectorForm } from './lector-form';

const LECTOR: Lector = {
  id: 7,
  nombre: 'Ana',
  direccion: 'Calle 1',
  telefono: '300',
  email: 'ana@x.com',
  status: 'active',
};

describe('LectorForm', () => {
  async function crear(lector: Lector | null = null) {
    const fixture = TestBed.createComponent(LectorForm);
    fixture.componentRef.setInput('lector', lector);
    await fixture.whenStable();
    const emitidos: LectorPayload[] = [];
    fixture.componentInstance.saved.subscribe((payload) => emitidos.push(payload));
    return { fixture, form: fixture.componentInstance, emitidos };
  }

  it('starts empty and active in create mode', async () => {
    const { form } = await crear();
    expect(form.form.getRawValue().nombre).toBe('');
    expect(form.form.controls.status.enabled).toBe(true);
  });

  it('does not emit when the name is empty', async () => {
    const { form, emitidos } = await crear();
    form.submit();
    expect(emitidos).toHaveLength(0);
    expect(form.form.controls.nombre.touched).toBe(true);
  });

  it('emits a trimmed payload with status on create', async () => {
    const { form, emitidos } = await crear();
    form.form.patchValue({ nombre: '  Luis  ', email: '' });
    form.submit();
    expect(emitidos[0]).toEqual({
      nombre: 'Luis',
      direccion: null,
      telefono: null,
      email: null,
      status: 'active',
    });
  });

  it('loads the lector and disables status in edit mode, sending no status', async () => {
    const { form, emitidos } = await crear(LECTOR);
    expect(form.form.controls.nombre.value).toBe('Ana');
    expect(form.form.controls.status.disabled).toBe(true);
    form.submit();
    expect(emitidos[0]).not.toHaveProperty('status');
  });

  it('resets when resetKey changes even if lector stays null', async () => {
    const { fixture, form } = await crear();
    form.form.patchValue({ nombre: 'borrador' });
    fixture.componentRef.setInput('resetKey', 1);
    await fixture.whenStable();
    expect(form.form.controls.nombre.value).toBe('');
  });
});
