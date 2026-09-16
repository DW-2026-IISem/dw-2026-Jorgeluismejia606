import { Injectable, NotFoundException, BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE_TOKEN } from '../../../../../common/constants/database.constants';
import { PrestamoModel } from '../infrastructure/persistence/models/prestamo.model';
import { EjemplarModel } from '../../ejemplares/infrastructure/persistence/models/ejemplar.model';
import { LectorModel } from '../../lectores/infrastructure/persistence/models/lector.model';
import { ReservaModel } from '../../reservas/infrastructure/persistence/models/reserva.model';
import { MultaModel } from '../../multas/infrastructure/persistence/models/multa.model';
import { EstadoEjemplar, EstadoPrestamo, EstadoReserva, EstadoMulta } from '../../../../../common/enums';
import { CreatePrestamoDto, DevolverPrestamoDto, RenovarPrestamoDto } from '../dto/prestamo.dto';

@Injectable()
export class PrestamosBusinessService {
  constructor(
    @Inject(SEQUELIZE_TOKEN)
    private readonly sequelize: Sequelize,
  ) {}

  async crear(dto: CreatePrestamoDto) {
    const lector = await LectorModel.findByPk(dto.lectorId);
    if (!lector || !lector.is_active) throw new NotFoundException('Lector no registrado o inactivo');

    const ejemplar = await EjemplarModel.findByPk(dto.ejemplarId);
    if (!ejemplar || !ejemplar.is_active) throw new NotFoundException('Ejemplar no encontrado');

    // RN-01: Disponibilidad
    if (ejemplar.estado !== EstadoEjemplar.DISPONIBLE) {
      throw new BadRequestException(`RN-01: El ejemplar no está DISPONIBLE (Estado: ${ejemplar.estado})`);
    }

    return this.sequelize.transaction(async (t) => {
      await ejemplar.update({ estado: EstadoEjemplar.PRESTADO }, { transaction: t });

      return PrestamoModel.create({
        lector_id: dto.lectorId,
        ejemplar_id: dto.ejemplarId,
        fecha_inicio: new Date(),
        fecha_fin: new Date(dto.fechaFin),
        estado: EstadoPrestamo.ACTIVO,
        observaciones: dto.observaciones,
      }, { transaction: t });
    });
  }

  async devolver(id: number, dto: DevolverPrestamoDto) {
    const prestamo = await PrestamoModel.findByPk(id, { include: [EjemplarModel] });
    if (!prestamo) throw new NotFoundException('Préstamo no encontrado');
    if (prestamo.estado !== EstadoPrestamo.ACTIVO) {
      throw new BadRequestException('El préstamo ya se encuentra finalizado');
    }

    return this.sequelize.transaction(async (t) => {
      const fechaDev = new Date(dto.fechaDevolucion);
      await prestamo.update({
        fecha_devolucion: fechaDev,
        estado: EstadoPrestamo.DEVUELTO,
        observaciones: dto.observaciones || prestamo.observaciones,
      }, { transaction: t });

      const ejemplar = await EjemplarModel.findByPk(prestamo.ejemplar_id, { transaction: t });

      // RN-08: Daños y pérdidas
      if (dto.perdido) {
        await ejemplar?.update({ estado: EstadoEjemplar.PERDIDO }, { transaction: t });
        await MultaModel.create({
          prestamo_id: prestamo.id,
          nombre: 'Pérdida de ejemplar',
          monto: 50.0,
          estado: EstadoMulta.PENDIENTE,
          fecha_generacion: new Date(),
        }, { transaction: t });
      } else if (dto.danado) {
        await ejemplar?.update({ estado: EstadoEjemplar.DANADO }, { transaction: t });
        await MultaModel.create({
          prestamo_id: prestamo.id,
          nombre: 'Daño en ejemplar',
          monto: 20.0,
          estado: EstadoMulta.PENDIENTE,
          fecha_generacion: new Date(),
        }, { transaction: t });
      } else {
        // RN-06: Vuelve a DISPONIBLE
        await ejemplar?.update({ estado: EstadoEjemplar.DISPONIBLE }, { transaction: t });
      }

      // RN-08: Cálculo de mora
      if (fechaDev.getTime() > prestamo.fecha_fin.getTime()) {
        const diffMs = fechaDev.getTime() - prestamo.fecha_fin.getTime();
        const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        await MultaModel.create({
          prestamo_id: prestamo.id,
          nombre: `Retraso de ${dias} día(s)`,
          monto: dias * 1.5,
          estado: EstadoMulta.PENDIENTE,
          fecha_generacion: new Date(),
        }, { transaction: t });
      }

      return PrestamoModel.findByPk(id, { include: [EjemplarModel, MultaModel], transaction: t });
    });
  }

  async renovar(id: number, dto: RenovarPrestamoDto) {
    const prestamo = await PrestamoModel.findByPk(id, { include: [EjemplarModel] });
    if (!prestamo) throw new NotFoundException('Préstamo no encontrado');
    if (prestamo.estado !== EstadoPrestamo.ACTIVO) {
      throw new BadRequestException('Solo préstamos activos pueden ser renovados');
    }

    // RN-05: Validar reservas activas sobre el libro
    const reservasEnEspera = await ReservaModel.count({
      where: {
        libro_id: prestamo.ejemplar.libro_id,
        estado: EstadoReserva.PENDIENTE,
      },
    });

    if (reservasEnEspera > 0) {
      throw new ConflictException('RN-05: Existen reservas en espera para este libro; no es posible renovar');
    }

    await prestamo.update({ fecha_fin: new Date(dto.nuevaFechaFin) });
    return prestamo;
  }
}
