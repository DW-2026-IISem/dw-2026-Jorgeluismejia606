import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EstadoMulta } from '@/common/enums';
import { MultaModel } from '../../infrastructure/persistence/models/multa.model';
import { PrestamoModel } from '../../../prestamos/infrastructure/persistence/models/prestamo.model';
import { LectorModel } from '../../../lectores/infrastructure/persistence/models/lector.model';
import { CreateMultaDto } from '../../presentation/dto/create-multa.dto';
import { UpdateMultaDto } from '../../presentation/dto/update-multa.dto';

/** Cada multa con su préstamo y el lector que debe pagarla. */
const INCLUDE = [
  {
    model: PrestamoModel,
    attributes: ['id', 'lector_id', 'ejemplar_id', 'estado', 'fecha_fin', 'fecha_devolucion'],
    include: [{ model: LectorModel, attributes: ['id', 'nombre'] }],
  },
];

/**
 * Multas: consultar, pagar y corregir. Una multa PAGADA es un registro
 * contable: ya no se edita, no se anula y no se elimina.
 */
@Injectable()
export class MultasService {
  private async findOrFail(id: number) {
    const multa = await MultaModel.findByPk(id);
    if (!multa) throw new NotFoundException(`Multa con id ${id} no encontrada`);
    return multa;
  }

  private assertPendiente(multa: MultaModel, accion: string) {
    if (multa.estado !== EstadoMulta.PENDIENTE) {
      throw new ConflictException(`La multa ya está ${multa.estado}: no se puede ${accion}`);
    }
  }

  async getAll(filtros: { prestamoId?: number; estado?: string }) {
    const estado = Object.values(EstadoMulta).includes(filtros.estado as EstadoMulta)
      ? (filtros.estado as EstadoMulta)
      : undefined;
    return MultaModel.findAll({
      where: {
        is_active: true,
        ...(filtros.prestamoId ? { prestamo_id: filtros.prestamoId } : {}),
        ...(estado ? { estado } : {}),
      },
      include: INCLUDE,
      order: [['id', 'DESC']],
    });
  }

  async getOne(id: number) {
    const multa = await MultaModel.findByPk(id, { include: INCLUDE });
    if (!multa) throw new NotFoundException(`Multa con id ${id} no encontrada`);
    return multa;
  }

  async create(dto: CreateMultaDto) {
    const prestamo = await PrestamoModel.findByPk(dto.prestamo_id);
    if (!prestamo) throw new NotFoundException(`Préstamo con id ${dto.prestamo_id} no encontrado`);
    const multa = await MultaModel.create({
      prestamo_id: dto.prestamo_id,
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion?.trim() || null,
      monto: dto.monto,
      estado: EstadoMulta.PENDIENTE,
      fecha_generacion: new Date(),
      is_active: true,
    });
    return this.getOne(multa.id);
  }

  async update(id: number, dto: UpdateMultaDto) {
    const multa = await this.findOrFail(id);
    this.assertPendiente(multa, 'editar');
    await multa.update({
      ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim() } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion.trim() || null } : {}),
      ...(dto.monto !== undefined ? { monto: dto.monto } : {}),
    });
    return this.getOne(id);
  }

  async pagar(id: number) {
    const multa = await this.findOrFail(id);
    this.assertPendiente(multa, 'pagar de nuevo');
    await multa.update({ estado: EstadoMulta.PAGADA, fecha_pago: new Date() });
    return this.getOne(id);
  }

  /** Anular (condonar) una multa pendiente: deja de listarse. */
  async deleteLogical(id: number) {
    const multa = await this.findOrFail(id);
    this.assertPendiente(multa, 'anular');
    await multa.update({ is_active: false });
    return { message: 'Multa anulada (borrado lógico)', id };
  }

  async deletePhysical(id: number) {
    const multa = await this.findOrFail(id);
    this.assertPendiente(multa, 'eliminar (es un registro contable)');
    await multa.destroy();
    return { message: 'Multa eliminada permanentemente', id };
  }
}
