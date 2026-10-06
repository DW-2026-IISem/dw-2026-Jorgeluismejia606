import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriaModel } from '../../infrastructure/persistence/models/categoria.model';
import { CreateCategoriaDto } from '../../presentation/dto/create-categoria.dto';
import { UpdateCategoriaDto } from '../../presentation/dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  async getAll() {
    return CategoriaModel.findAll({ where: { is_active: true } });
  }

  async getOne(id: number) {
    const categoria = await CategoriaModel.findByPk(id);
    if (!categoria) throw new NotFoundException(`Categoría con id ${id} no encontrada`);
    return categoria;
  }

  async create(dto: CreateCategoriaDto) {
    return CategoriaModel.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      is_active: true,
    });
  }

  async updatePut(id: number, dto: CreateCategoriaDto) {
    const categoria = await this.getOne(id);
    await categoria.update({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
    });
    return categoria;
  }

  async updatePatch(id: number, dto: UpdateCategoriaDto) {
    const categoria = await this.getOne(id);
    await categoria.update(dto);
    return categoria;
  }

  async deletePhysical(id: number) {
    const categoria = await this.getOne(id);
    await categoria.destroy();
    return { message: 'Categoría eliminada permanentemente', id };
  }

  async deleteLogical(id: number) {
    const categoria = await this.getOne(id);
    await categoria.update({ is_active: false });
    return { message: 'Categoría desactivada (borrado lógico)', categoria };
  }
}
