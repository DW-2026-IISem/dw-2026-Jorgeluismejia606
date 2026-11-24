import { CrudController } from "../../../shared/crud.controller";
import { Lector } from "./lector.model";

/** CRUD de lectores (equivale a «clientes» de la guía). Nunca devuelve `password`. */
export class LectorController extends CrudController<Lector> {
  constructor() {
    super({
      model: Lector,
      plural: "lectores",
      singular: "lector",
      label: "Lector",
      fields: ["nombre", "direccion", "telefono", "email", "password", "status"],
      required: ["nombre"],
      onlyActive: true,
      order: [["nombre", "ASC"]],
    });
  }

  protected override serialize(row: Lector): object {
    return row.toSafeJSON();
  }
}
