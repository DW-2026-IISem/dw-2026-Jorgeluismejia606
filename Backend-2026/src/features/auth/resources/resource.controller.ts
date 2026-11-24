import { CrudController } from "../../../shared/crud.controller";
import { HttpError } from "../../../shared/http";
import { HTTP_METHODS, Resource } from "./resource.model";

/** /api/recursos — catálogo de pares (method, path) que protege `authorize`. */
export class ResourceController extends CrudController<Resource> {
  constructor() {
    super({
      model: Resource,
      plural: "resources",
      singular: "resource",
      label: "Recurso",
      fields: ["path", "method", "description", "status"],
      required: ["path", "method"],
    });
  }

  protected override async beforeSave(data: Record<string, unknown>): Promise<void> {
    if (data.method !== undefined) {
      const method = String(data.method).toUpperCase();
      if (!HTTP_METHODS.includes(method as never)) {
        throw new HttpError(400, "method inválido", `Valores permitidos: ${HTTP_METHODS.join(", ")}`);
      }
      data.method = method;
    }
    if (typeof data.path === "string") data.path = data.path.trim().replace(/\/+$/, "");
  }
}
