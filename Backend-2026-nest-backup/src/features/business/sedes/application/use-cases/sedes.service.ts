import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { SedeModel } from '../../infrastructure/persistence/models/sede.model';
import { EjemplarModel } from '../../../ejemplares/infrastructure/persistence/models/ejemplar.model';
import { CreateSedeDto } from '../../presentation/dto/create-sede.dto';
import { UpdateSedeDto } from '../../presentation/dto/update-sede.dto';

/** CRUD de sedes, mismo patrón que AutoresService. */
@Injectable()
export class SedesService {
  async getAll() {
    return SedeModel.findAll({ where: { is_active: true }, order: [['nombre', 'ASC']] });
  }

  async getOne(id: number) {
    const sede = await SedeModel.findByPk(id);
    if (!sede) throw new NotFoundException(`Sede con id ${id} no encontrada`);
    return sede;
  }

  async create(dto: CreateSedeDto) {
    return SedeModel.create({
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion?.trim() || null,
      is_active: true,
    });
  }

  async updatePut(id: number, dto: CreateSedeDto) {
    const sede = await this.getOne(id);
    await sede.update({ nombre: dto.nombre.trim(), descripcion: dto.descripcion?.trim() || null });
    return sede;
  }

  async updatePatch(id: number, dto: UpdateSedeDto) {
    const sede = await this.getOne(id);
    await sede.update({
      ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim() } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion.trim() || null } : {}),
    });
    return sede;
  }

  /** No se borra una sede con ejemplares: quedarían copias sin ubicación. */
  async deletePhysical(id: number) {
    const sede = await this.getOne(id);
    const ejemplares = await EjemplarModel.count({ where: { sede_id: id } });
    if (ejemplares > 0) {
      throw new ConflictException(
        `La sede tiene ${ejemplares} ejemplar(es): muévelos o desactiva la sede en su lugar`,
      );
    }
    await sede.destroy();
    return { message: 'Sede eliminada permanentemente', id };
  }

  async deleteLogical(id: number) {
    const sede = await this.getOne(id);
    await sede.update({ is_active: false });
    return { message: 'Sede desactivada (borrado lógico)', sede };
  }
}
