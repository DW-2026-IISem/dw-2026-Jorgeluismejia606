import { CrudController } from "../../../shared/crud.controller";
import { HttpError } from "../../../shared/http";
import { Categoria } from "../categorias/categoria.model";
import { Libro } from "./libro.model";

/** CRUD de libros (equivale a «productos»). Valida que la Categoría exista y esté activa. */
export class LibroController extends CrudController<Libro> {
  constructor() {
    super({
      model: Libro,
      plural: "libros",
      singular: "libro",
      label: "Libro",
      fields: ["titulo", "autor", "precio_prestamo", "stock_minimo", "cantidad", "categoria_id", "status"],
      required: ["titulo", "autor", "precio_prestamo", "stock_minimo", "cantidad", "categoria_id"],
      onlyActive: true,
      order: [["titulo", "ASC"]],
    });
  }

  protected override async beforeSave(data: Record<string, unknown>, current?: Libro): Promise<void> {
    for (const field of ["precio_prestamo", "stock_minimo", "cantidad", "categoria_id"]) {
      if (data[field] !== undefined && !Number.isFinite(Number(data[field]))) {
        throw new HttpError(400, `${field} debe ser numérico`);
      }
    }
    const categoriaId = data.categoria_id ?? current?.categoria_id;
    if (data.categoria_id !== undefined || !current) {
      const categoria = await Categoria.findByPk(Number(categoriaId));
      if (!categoria) throw new HttpError(400, "La categoría no existe", `categoria_id=${String(categoriaId)}`);
      if (categoria.status !== "active") {
        throw new HttpError(400, "La categoría está inactiva", `categoria_id=${String(categoriaId)}`);
      }
    }
  }
}
