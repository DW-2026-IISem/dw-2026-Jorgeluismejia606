import { HttpMethod } from '../models/resource.model';

type Severity = 'info' | 'success' | 'warn' | 'danger' | 'secondary';

/** Semáforo de verbos HTTP para p-tag (recursos y concesiones). */
export function methodSeverity(method: HttpMethod | string | undefined): Severity {
  switch (method) {
    case 'GET':
      return 'info';
    case 'POST':
      return 'success';
    case 'PUT':
    case 'PATCH':
      return 'warn';
    case 'DELETE':
      return 'danger';
    default:
      return 'secondary';
  }
}
