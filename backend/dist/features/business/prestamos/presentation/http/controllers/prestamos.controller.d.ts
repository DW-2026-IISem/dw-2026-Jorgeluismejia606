import { EjemplarModel } from '@/features/business/ejemplares/infrastructure/persistence/models/ejemplar.model';
import { PrestamosBusinessService } from '../../../application/use-cases/prestamos.service';
import { CreatePrestamoDto, DevolverPrestamoDto, RenovarPrestamoDto } from '../../../application/dto/prestamo.dto';
export declare class PrestamosController {
    private readonly service;
    constructor(service: PrestamosBusinessService);
    stats(): Promise<{
        nivel: string;
        totalPrestamosRegistrados: any;
    }>;
    resumenInterno(): Promise<{
        nivel: string;
        prestamos: any;
    }>;
    listarPrestamos(): Promise<{
        nivel: string;
        data: any;
    }>;
    crearPrestamo(body: any): Promise<{
        nivel: string;
        data: any;
    }>;
    listado(): any;
    registrar(dto: CreatePrestamoDto): Promise<any>;
    devolver(id: number, dto: DevolverPrestamoDto): Promise<any>;
    renovar(id: number, dto: RenovarPrestamoDto): Promise<any>;
    ejemplaresDisponibles(): Promise<EjemplarModel[]>;
}
