import { CrudController } from "../../../shared/crud.controller";
import { Role } from "./role.model";

/** /api/roles — `name` se normaliza a MAYÚSCULAS en el modelo. */
export class RoleController extends CrudController<Role> {
  constructor() {
    super({
      model: Role,
      plural: "roles",
      singular: "role",
      label: "Rol",
      fields: ["name", "description", "status"],
      required: ["name"],
    });
  }
}
