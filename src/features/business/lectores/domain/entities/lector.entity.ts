export interface LectorProps {
  id?: number;
  nombre: string;
  descripcion?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Lector {
  id?: number;
  nombre: string;
  descripcion?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: LectorProps) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.descripcion = props.descripcion;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
