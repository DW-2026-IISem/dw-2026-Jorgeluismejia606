import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LibroModel } from '../../infrastructure/persistence/models/libro.model';
import { CategoriaModel } from '../../../categorias/infrastructure/persistence/models/categoria.model';
import { EjemplarModel } from '../../../ejemplares/infrastructure/persistence/models/ejemplar.model';
import { CreateLibroDto } from '../../presentation/dto/create-libro.dto';
import { UpdateLibroDto } from '../../presentation/dto/update-libro.dto';

@Injectable()
export class LibrosService {
  private async assertActiveCategoria(categoria_id: number) {
    const categoria = await CategoriaModel.findByPk(categoria_id);
    if (!categoria) throw new NotFoundException(`Categoría ID ${categoria_id} no encontrada`);
    if (!categoria.is_active) throw new BadRequestException(`La categoría ID ${categoria_id} está inactiva`);
  }

  async getAll() {
    return LibroModel.findAll({
      where: { is_active: true },
      include: [
        { model: CategoriaModel, as: 'categoria' },
        { model: EjemplarModel, as: 'ejemplares' },
      ],
    });
  }

  async getOne(id: number) {
    const libro = await LibroModel.findByPk(id, {
      include: [
        { model: CategoriaModel, as: 'categoria' },
        { model: EjemplarModel, as: 'ejemplares' },
      ],
    });
    if (!libro) throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    return libro;
  }

  async create(dto: CreateLibroDto) {
    await this.assertActiveCategoria(dto.categoria_id);
    return LibroModel.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      categoria_id: dto.categoria_id,
      is_active: true,
    });
  }

  async updatePut(id: number, dto: CreateLibroDto) {
    const libro = await this.getOne(id);
    await this.assertActiveCategoria(dto.categoria_id);
    await libro.update({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      categoria_id: dto.categoria_id,
    });
    return libro;
  }

  async updatePatch(id: number, dto: UpdateLibroDto) {
    const libro = await this.getOne(id);
    if (dto.categoria_id) {
      await this.assertActiveCategoria(dto.categoria_id);
    }
    await libro.update(dto);
    return libro;
  }

  async deletePhysical(id: number) {
    const libro = await this.getOne(id);
    await libro.destroy();
    return { message: 'Libro eliminado físicamente', id };
  }

  async deleteLogical(id: number) {
    const libro = await this.getOne(id);
    await libro.update({ is_active: false });
    return { message: 'Libro desactivado lógicamente', libro };
  }
}
