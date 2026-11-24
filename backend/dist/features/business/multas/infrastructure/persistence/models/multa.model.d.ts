import { Model } from 'sequelize-typescript';
import { EstadoMulta } from '../../../../../../common/enums';
import { PrestamoModel } from '../../../../prestamos/infrastructure/persistence/models/prestamo.model';
export declare class MultaModel extends Model {
    id: number;
    prestamo_id: number;
    nombre: string;
    descripcion: string;
    monto: number;
    estado: EstadoMulta;
    fecha_generacion: Date;
    fecha_pago: Date;
    is_active: boolean;
    prestamo: PrestamoModel;
}
