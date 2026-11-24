import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoReserva } from '@/common/enums';
import { ReservaModel } from '../../infrastructure/persistence/models/reserva.model';
import { LectorModel } from '../../../lectores/infrastructure/persistence/models/lector.model';
import { LibroModel } from '../../../libros/infrastructure/persistence/models/libro.model';
import { CreateReservaDto } from '../../presentation/dto/create-reserva.dto';
import { UpdateReservaDto } from '../../presentation/dto/update-reserva.dto';

const INCLUDE = [
  { model: LectorModel, attributes: ['id', 'nombre'] },
  { model: LibroModel, attributes: ['id', 'nombre'] },
];

/**
 * Reservas. Una reserva PENDIENTE de un libro bloquea la renovación de sus
 * préstamos (regla RN-05 de PrestamosBusinessService.renovar()).
 */
@Injectable()
export class ReservasService {
  private async findOrFail(id: number) {
    const reserva = await ReservaModel.findByPk(id);
    if (!reserva) throw new NotFoundException(`Reserva con id ${id} no encontrada`);
    return reserva;
  }

  private assertPendiente(reserva: ReservaModel, accion: string) {
    if (reserva.estado !== EstadoReserva.PENDIENTE) {
      throw new ConflictException(`La reserva ya está ${reserva.estado}: no se puede ${accion}`);
    }
  }

  private assertFechaFutura(fecha: string) {
    if (new Date(fecha).getTime() <= Date.now()) {
      throw new BadRequestException('fecha_fin debe ser una fecha futura');
    }
  }

  async getAll(filtros: { libroId?: number; lectorId?: number; estado?: string }) {
    const estado = Object.values(EstadoReserva).includes(filtros.estado as EstadoReserva)
      ? (filtros.estado as EstadoReserva)
      : undefined;
    return ReservaModel.findAll({
      where: {
        ...(filtros.libroId ? { libro_id: filtros.libroId } : {}),
        ...(filtros.lectorId ? { lector_id: filtros.lectorId } : {}),
        ...(estado ? { estado } : {}),
      },
      include: INCLUDE,
      order: [['id', 'DESC']],
    });
  }

  async getOne(id: number) {
    const reserva = await ReservaModel.findByPk(id, { include: INCLUDE });
    if (!reserva) throw new NotFoundException(`Reserva con id ${id} no encontrada`);
    return reserva;
  }

  async create(dto: CreateReservaDto) {
    const lector = await LectorModel.findByPk(dto.lector_id);
    if (!lector || !lector.is_active) throw new NotFoundException('Lector no registrado o inactivo');
    const libro = await LibroModel.findByPk(dto.libro_id);
    if (!libro || !libro.is_active) throw new NotFoundException('Libro no encontrado o inactivo');
    this.assertFechaFutura(dto.fecha_fin);

    const duplicada = await ReservaModel.findOne({
      where: { lector_id: dto.lector_id, libro_id: dto.libro_id, estado: EstadoReserva.PENDIENTE },
    });
    if (duplicada) {
      throw new ConflictException(`El lector ya tiene una reserva pendiente de ese libro (id ${duplicada.id})`);
    }

    const reserva = await ReservaModel.create({
      lector_id: dto.lector_id,
      libro_id: dto.libro_id,
      fecha_inicio: new Date(),
      fecha_fin: new Date(dto.fecha_fin),
      estado: EstadoReserva.PENDIENTE,
      observaciones: dto.observaciones?.trim() || null,
    });
    return this.getOne(reserva.id);
  }

  async update(id: number, dto: UpdateReservaDto) {
    const reserva = await this.findOrFail(id);
    this.assertPendiente(reserva, 'editar');
    if (dto.fecha_fin) this.assertFechaFutura(dto.fecha_fin);
    await reserva.update({
      ...(dto.fecha_fin ? { fecha_fin: new Date(dto.fecha_fin) } : {}),
      ...(dto.observaciones !== undefined ? { observaciones: dto.observaciones.trim() || null } : {}),
    });
    return this.getOne(id);
  }

  async atender(id: number) {
    const reserva = await this.findOrFail(id);
    this.assertPendiente(reserva, 'atender');
    await reserva.update({ estado: EstadoReserva.ATENDIDA });
    return this.getOne(id);
  }

  async cancelar(id: number) {
    const reserva = await this.findOrFail(id);
    this.assertPendiente(reserva, 'cancelar');
    await reserva.update({ estado: EstadoReserva.CANCELADA });
    return this.getOne(id);
  }

  /** Una reserva pendiente se cancela primero: así queda el rastro de la decisión. */
  async deletePhysical(id: number) {
    const reserva = await this.findOrFail(id);
    if (reserva.estado === EstadoReserva.PENDIENTE) {
      throw new ConflictException('La reserva está PENDIENTE: cancélala antes de eliminarla');
    }
    await reserva.destroy();
    return { message: 'Reserva eliminada permanentemente', id };
  }
}
