import { CrudController } from "../../../shared/crud.controller";
import { Categoria } from "./categoria.model";

/** CRUD de categorías (equivale a «tipos de producto» de la guía). */
export class CategoriaController extends CrudController<Categoria> {
  constructor() {
    super({
      model: Categoria,
      plural: "categorias",
      singular: "categoria",
      label: "Categoría",
      fields: ["nombre", "descripcion", "status"],
      required: ["nombre"],
      onlyActive: true,
      order: [["nombre", "ASC"]],
    });
  }
}
