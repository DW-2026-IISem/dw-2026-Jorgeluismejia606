import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { PrestamosBusinessService } from './application/use-cases/prestamos.service';
import { LectorModel } from '../lectores/infrastructure/persistence/models/lector.model';
import { EjemplarModel } from '../ejemplares/infrastructure/persistence/models/ejemplar.model';
import { PrestamoModel } from './infrastructure/persistence/models/prestamo.model';
import { ReservaModel } from '../reservas/infrastructure/persistence/models/reserva.model';
import { EstadoEjemplar, EstadoPrestamo } from '../../../common/enums';

describe('PrestamosBusinessService — Verificación de Reglas de Negocio', () => {
  let service: PrestamosBusinessService;
  const mockSequelize = {
    transaction: vi.fn(async (cb) => cb({})),
  } as any;

  beforeEach(() => {
    service = new PrestamosBusinessService(mockSequelize);
    vi.restoreAllMocks();
  });

  it('RN-01: Debe rechazar el préstamo si el ejemplar NO está en estado DISPONIBLE', async () => {
    vi.spyOn(LectorModel, 'findByPk').mockResolvedValue({ id: 1, is_active: true } as any);
    vi.spyOn(EjemplarModel, 'findByPk').mockResolvedValue({
      id: 2,
      estado: EstadoEjemplar.MANTENIMIENTO,
      is_active: true,
    } as any);

    await expect(
      service.crear({ lectorId: 1, ejemplarId: 2, fechaFin: '2026-11-30' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('RN-05: Debe denegar la renovación si existen reservas en espera para el libro', async () => {
    vi.spyOn(PrestamoModel, 'findByPk').mockResolvedValue({
      id: 1,
      estado: EstadoPrestamo.ACTIVO,
      ejemplar: { libro_id: 10 },
    } as any);
    vi.spyOn(ReservaModel, 'count').mockResolvedValue(1); // 1 reserva pendiente

    await expect(
      service.renovar(1, { nuevaFechaFin: '2026-12-15' }),
    ).rejects.toThrow(ConflictException);
  });
});
