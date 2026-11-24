import { Injectable, NotFoundException } from '@nestjs/common';
import { AutorModel } from '../../infrastructure/persistence/models/autor.model';
import { LibroAutorModel } from '../../../libros/infrastructure/persistence/models/libro-autor.model';
import { CreateAutorDto } from '../../presentation/dto/create-autor.dto';
import { UpdateAutorDto } from '../../presentation/dto/update-autor.dto';

/** CRUD de autores, mismo patrón que CategoriasService. */
@Injectable()
export class AutoresService {
  async getAll() {
    return AutorModel.findAll({
      where: { is_active: true },
      attributes: ['id', 'nombre', 'descripcion', 'is_active'],
      order: [['nombre', 'ASC']],
    });
  }

  async getOne(id: number) {
    const autor = await AutorModel.findByPk(id);
    if (!autor) throw new NotFoundException(`Autor con id ${id} no encontrado`);
    return autor;
  }

  async create(dto: CreateAutorDto) {
    return AutorModel.create({
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion?.trim() || null,
      is_active: true,
    });
  }

  async updatePut(id: number, dto: CreateAutorDto) {
    const autor = await this.getOne(id);
    await autor.update({
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion?.trim() || null,
    });
    return autor;
  }

  async updatePatch(id: number, dto: UpdateAutorDto) {
    const autor = await this.getOne(id);
    await autor.update({
      ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim() } : {}),
      ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion.trim() || null } : {}),
    });
    return autor;
  }

  /** Baja física: también borra sus filas en libro_autores (la pivote no tiene FK). */
  async deletePhysical(id: number) {
    const autor = await this.getOne(id);
    await LibroAutorModel.destroy({ where: { relacionado_id: id } });
    await autor.destroy();
    return { message: 'Autor eliminado permanentemente junto con sus relaciones', id };
  }

  /** Baja lógica: deja de listarse y de aparecer en los libros (el include filtra activos). */
  async deleteLogical(id: number) {
    const autor = await this.getOne(id);
    await autor.update({ is_active: false });
    return { message: 'Autor desactivado (borrado lógico)', autor };
  }
}
