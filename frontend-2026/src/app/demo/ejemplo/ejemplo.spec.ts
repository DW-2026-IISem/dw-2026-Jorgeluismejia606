import { TestBed } from '@angular/core/testing';
import { Ejemplo } from './ejemplo';

describe('Ejemplo', () => {
  beforeEach(async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await TestBed.configureTestingModule({ imports: [Ejemplo] }).compileComponents();
  });

  async function crear() {
    const fixture = TestBed.createComponent(Ejemplo);
    await fixture.whenStable();
    return { fixture, html: fixture.nativeElement as HTMLElement };
  }

  function boton(html: HTMLElement, texto: string): HTMLButtonElement {
    return [...html.querySelectorAll('button')].find((b) => b.textContent?.trim() === texto)!;
  }

  it('should start with the initial book and price', async () => {
    const { html } = await crear();
    expect(html.textContent).toContain('18000');
    expect(html.textContent).toContain('21420');
  });

  it('should add 1000 to the price and recompute VAT', async () => {
    const { fixture, html } = await crear();
    boton(html, '+1000').click();
    await fixture.whenStable();
    expect(html.textContent).toContain('19000');
    expect(html.textContent).toContain('22610');
  });

  it('should toggle the status', async () => {
    const { fixture, html } = await crear();
    boton(html, 'Cambiar estado').click();
    await fixture.whenStable();
    expect(html.textContent).toContain('Inactivo');
  });

  it('should reset the object', async () => {
    const { fixture, html } = await crear();
    boton(html, '+1000').click();
    boton(html, 'Reiniciar').click();
    await fixture.whenStable();
    expect(html.textContent).toContain('18000');
  });
});
