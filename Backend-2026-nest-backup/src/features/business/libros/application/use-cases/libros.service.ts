import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Op } from 'sequelize';
import { LibroModel } from '../../infrastructure/persistence/models/libro.model';
import { LibroAutorModel } from '../../infrastructure/persistence/models/libro-autor.model';
import { CategoriaModel } from '../../../categorias/infrastructure/persistence/models/categoria.model';
import { EjemplarModel } from '../../../ejemplares/infrastructure/persistence/models/ejemplar.model';
import { AutorModel } from '../../../autores/infrastructure/persistence/models/autor.model';
import { CreateLibroDto } from '../../presentation/dto/create-libro.dto';
import { UpdateLibroDto } from '../../presentation/dto/update-libro.dto';

const PRINCIPAL = 'Autor principal';
const COAUTOR = 'Coautor';

/** Categoría, ejemplares y autores activos (con el dato de la relación). */
const INCLUDE = [
  { model: CategoriaModel, as: 'categoria' },
  { model: EjemplarModel, as: 'ejemplares' },
  {
    model: AutorModel,
    as: 'autores',
    attributes: ['id', 'nombre', 'descripcion'],
    where: { is_active: true },
    required: false,
    through: { attributes: ['datos_relacion'], where: { is_active: true } },
  },
];

/**
 * Respuesta limpia: Sequelize anida los datos de la pivote bajo el nombre del
 * modelo (`LibroAutorModel`). Se aplana como `relacion` y el principal va primero.
 */
function formatear(libro: LibroModel) {
  const json = libro.toJSON() as Record<string, any>;
  const autores = (json.autores ?? [])
    .map(({ LibroAutorModel: pivote, ...autor }: Record<string, any>) => ({
      ...autor,
      relacion: pivote?.datos_relacion ?? null,
    }))
    .sort((a: { relacion: string }, b: { relacion: string }) =>
      a.relacion === PRINCIPAL ? -1 : b.relacion === PRINCIPAL ? 1 : 0,
    );
  return { ...json, autores };
}

@Injectable()
export class LibrosService {
  private async assertActiveCategoria(categoria_id: number) {
    const categoria = await CategoriaModel.findByPk(categoria_id);
    if (!categoria) throw new NotFoundException(`Categoría ID ${categoria_id} no encontrada`);
    if (!categoria.is_active) throw new BadRequestException(`La categoría ID ${categoria_id} está inactiva`);
  }

  /** Todos los autores deben existir y estar activos. */
  private async assertAutores(ids: number[]) {
    if (ids.length === 0) return;
    const encontrados = await AutorModel.count({
      where: { id: { [Op.in]: ids }, is_active: true },
    });
    if (encontrados !== new Set(ids).size) {
      throw new BadRequestException('Uno o más autores no existen o están inactivos');
    }
  }

  /** Reemplaza los autores del libro: el primero es el principal. */
  private async setAutores(libroId: number, ids: number[]) {
    await LibroAutorModel.destroy({ where: { principal_id: libroId } });
    if (ids.length === 0) return;
    await LibroAutorModel.bulkCreate(
      ids.map((autorId, i) => ({
        principal_id: libroId,
        relacionado_id: autorId,
        datos_relacion: i === 0 ? PRINCIPAL : COAUTOR,
        is_active: true,
      })),
    );
  }

  /** Uso interno: la instancia para actualizar o borrar. */
  private async findOrFail(id: number) {
    const libro = await LibroModel.findByPk(id);
    if (!libro) throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    return libro;
  }

  async getAll() {
    const libros = await LibroModel.findAll({
      where: { is_active: true },
      include: INCLUDE,
      order: [['id', 'ASC']],
    });
    return libros.map(formatear);
  }

  async getOne(id: number) {
    const libro = await LibroModel.findByPk(id, { include: INCLUDE });
    if (!libro) throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    return formatear(libro);
  }

  async create(dto: CreateLibroDto) {
    await this.assertActiveCategoria(dto.categoria_id);
    await this.assertAutores(dto.autor_ids ?? []);
    const libro = await LibroModel.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      categoria_id: dto.categoria_id,
      is_active: true,
    });
    if (dto.autor_ids) await this.setAutores(libro.id, dto.autor_ids);
    return this.getOne(libro.id);
  }

  async updatePut(id: number, dto: CreateLibroDto) {
    const libro = await this.findOrFail(id);
    await this.assertActiveCategoria(dto.categoria_id);
    await this.assertAutores(dto.autor_ids ?? []);
    await libro.update({
      nombre: dto.nombre,
      descripcion: dto.descripcion ?? null,
      categoria_id: dto.categoria_id,
    });
    if (dto.autor_ids !== undefined) await this.setAutores(id, dto.autor_ids);
    return this.getOne(id);
  }

  async updatePatch(id: number, dto: UpdateLibroDto) {
    const libro = await this.findOrFail(id);
    const { autor_ids, ...campos } = dto;
    if (campos.categoria_id) await this.assertActiveCategoria(campos.categoria_id);
    if (autor_ids) await this.assertAutores(autor_ids);
    await libro.update(campos);
    if (autor_ids !== undefined) await this.setAutores(id, autor_ids);
    return this.getOne(id);
  }

  async deletePhysical(id: number) {
    const libro = await this.findOrFail(id);
    await LibroAutorModel.destroy({ where: { principal_id: id } });
    await libro.destroy();
    return { message: 'Libro eliminado físicamente', id };
  }

  async deleteLogical(id: number) {
    const libro = await this.findOrFail(id);
    await libro.update({ is_active: false });
    return { message: 'Libro desactivado lógicamente', libro };
  }
}
