import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EstadoEjemplar } from '@/common/enums';
import { EjemplarModel } from '../../infrastructure/persistence/models/ejemplar.model';
import { LibroModel } from '../../../libros/infrastructure/persistence/models/libro.model';
import { SedeModel } from '../../../sedes/infrastructure/persistence/models/sede.model';
import { PrestamoModel } from '../../../prestamos/infrastructure/persistence/models/prestamo.model';
import { CreateEjemplarDto } from '../../presentation/dto/create-ejemplar.dto';
import { UpdateEjemplarDto } from '../../presentation/dto/update-ejemplar.dto';

const INCLUDE = [
  { model: LibroModel, attributes: ['id', 'nombre'] },
  { model: SedeModel, attributes: ['id', 'nombre'] },
];

/**
 * CRUD de ejemplares. El estado PRESTADO pertenece al préstamo: aquí no se
 * asigna ni se quita, para no romper la transacción de PrestamosBusinessService.
 */
@Injectable()
export class EjemplaresService {
  private async assertLibro(id: number) {
    const libro = await LibroModel.findByPk(id);
    if (!libro) throw new NotFoundException(`Libro con id ${id} no encontrado`);
    if (!libro.is_active) throw new BadRequestException(`El libro con id ${id} está inactivo`);
  }

  private async assertSede(id: number) {
    const sede = await SedeModel.findByPk(id);
    if (!sede) throw new NotFoundException(`Sede con id ${id} no encontrada`);
    if (!sede.is_active) throw new BadRequestException(`La sede con id ${id} está inactiva`);
  }

  private async findOrFail(id: number) {
    const ejemplar = await EjemplarModel.findByPk(id);
    if (!ejemplar) throw new NotFoundException(`Ejemplar con id ${id} no encontrado`);
    return ejemplar;
  }

  /** Un ejemplar prestado solo admite cambios de nombre y descripción. */
  private assertEditable(ejemplar: EjemplarModel, dto: UpdateEjemplarDto) {
    if (ejemplar.estado !== EstadoEjemplar.PRESTADO) return;
    const cambiaAlgoProtegido =
      (dto.estado !== undefined && dto.estado !== ejemplar.estado) ||
      (dto.libro_id !== undefined && dto.libro_id !== ejemplar.libro_id) ||
      (dto.sede_id !== undefined && dto.sede_id !== ejemplar.sede_id);
    if (cambiaAlgoProtegido) {
      throw new ConflictException(
        'El ejemplar está PRESTADO: solo se puede cambiar su nombre o descripción hasta que se devuelva',
      );
    }
  }

  async getAll(libroId?: number) {
    return EjemplarModel.findAll({
      where: { is_active: true, ...(libroId ? { libro_id: libroId } : {}) },
      include: INCLUDE,
      order: [['id', 'ASC']],
    });
  }

  async getOne(id: number) {
    const ejemplar = await EjemplarModel.findByPk(id, { include: INCLUDE });
    if (!ejemplar) throw new NotFoundException(`Ejemplar con id ${id} no encontrado`);
    return ejemplar;
  }

  async create(dto: CreateEjemplarDto) {
    await this.assertLibro(dto.libro_id);
    await this.assertSede(dto.sede_id);
    const ejemplar = await EjemplarModel.create({
      libro_id: dto.libro_id,
      sede_id: dto.sede_id,
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion?.trim() || null,
      estado: dto.estado ?? EstadoEjemplar.DISPONIBLE,
      is_active: true,
    });
    return this.getOne(ejemplar.id);
  }

  async updatePut(id: number, dto: CreateEjemplarDto) {
    const ejemplar = await this.findOrFail(id);
    this.assertEditable(ejemplar, dto);
    await this.assertLibro(dto.libro_id);
    await this.assertSede(dto.sede_id);
    await ejemplar.update({
      libro_id: dto.libro_id,
      sede_id: dto.sede_id,
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion?.trim() || null,
      ...(dto.estado ? { estado: dto.estado } : {}),
    });
    return this.getOne(id);
  }

  async updatePatch(id: number, dto: UpdateEjemplarDto) {
    const ejemplar = await this.findOrFail(id);
    this.assertEditable(ejemplar, dto);
    if (dto.libro_id !== undefined) await this.assertLibro(dto.libro_id);
    if (dto.sede_id !== undefined) await this.assertSede(dto.sede_id);
    await ejemplar.update({
      ...(dto.libro_id !== undefined ? { libro_id: dto.libro_id } : {}),
      ...(dto.sede_id !== undefined ? { sede_id: dto.sede_id } : {}),
      ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim() } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion.trim() || null } : {}),
      ...(dto.estado !== undefined ? { estado: dto.estado } : {}),
    });
    return this.getOne(id);
  }

  /** Con historial de préstamos no se borra: se perdería la trazabilidad. */
  async deletePhysical(id: number) {
    const ejemplar = await this.findOrFail(id);
    if (ejemplar.estado === EstadoEjemplar.PRESTADO) {
      throw new ConflictException('El ejemplar está PRESTADO: primero registra su devolución');
    }
    const prestamos = await PrestamoModel.count({ where: { ejemplar_id: id } });
    if (prestamos > 0) {
      throw new ConflictException(
        `El ejemplar tiene ${prestamos} préstamo(s) en su historial: desactívalo en su lugar`,
      );
    }
    await ejemplar.destroy();
    return { message: 'Ejemplar eliminado permanentemente', id };
  }

  async deleteLogical(id: number) {
    const ejemplar = await this.findOrFail(id);
    if (ejemplar.estado === EstadoEjemplar.PRESTADO) {
      throw new ConflictException('El ejemplar está PRESTADO: primero registra su devolución');
    }
    await ejemplar.update({ is_active: false });
    return { message: 'Ejemplar desactivado (borrado lógico)', id };
  }
}
