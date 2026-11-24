import { Injectable, NotFoundException } from '@nestjs/common';
import { LectorModel } from '../../infrastructure/persistence/models/lector.model';
import { CreateLectorDto } from '../dto/create-lector.dto';
import { UpdateLectorDto } from '../dto/update-lector.dto';

/**
 * CRUD de lectores (Fase I, sin autenticación), mismo patrón que CategoriasService.
 * La creación sigue en POST /lectores, protegida con JWT + rol ADMIN (Nivel 4).
 */
@Injectable()
export class LectoresService {
  async getAll() {
    return LectorModel.findAll({ where: { is_active: true }, order: [['id', 'ASC']] });
  }

  async getOne(id: number) {
    const lector = await LectorModel.findByPk(id);
    if (!lector) throw new NotFoundException(`Lector con id ${id} no encontrado`);
    return lector;
  }

  async updatePut(id: number, dto: CreateLectorDto) {
    const lector = await this.getOne(id);
    await lector.update({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
    });
    return lector;
  }

  async updatePatch(id: number, dto: UpdateLectorDto) {
    const lector = await this.getOne(id);
    await lector.update(dto);
    return lector;
  }

  async deletePhysical(id: number) {
    const lector = await this.getOne(id);
    await lector.destroy();
    return { message: 'Lector eliminado permanentemente', id };
  }

  async deleteLogical(id: number) {
    const lector = await this.getOne(id);
    await lector.update({ is_active: false });
    return { message: 'Lector desactivado (borrado lógico)', lector };
  }
}
