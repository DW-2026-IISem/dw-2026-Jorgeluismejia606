import { Sequelize } from 'sequelize-typescript';
import { CreatePrestamoDto, DevolverPrestamoDto, RenovarPrestamoDto } from '../dto/prestamo.dto';
export declare class PrestamosBusinessService {
    private readonly sequelize;
    constructor(sequelize: Sequelize);
    crear(dto: CreatePrestamoDto): Promise<any>;
    devolver(id: number, dto: DevolverPrestamoDto): Promise<any>;
    renovar(id: number, dto: RenovarPrestamoDto): Promise<any>;
}
