import { Module } from '@nestjs/common';
import { LectoresModule } from './lectores/lectores.module';
import { PrestamosModule } from './prestamos/prestamos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { LibrosModule } from './libros/libros.module';
import { AutoresModule } from './autores/autores.module';
import { SedesModule } from './sedes/sedes.module';
import { EjemplaresModule } from './ejemplares/ejemplares.module';
import { MultasModule } from './multas/multas.module';
import { ReservasModule } from './reservas/reservas.module';

@Module({
  imports: [
    LectoresModule,
    PrestamosModule,
    CategoriasModule,
    LibrosModule,
    AutoresModule,
    SedesModule,
    EjemplaresModule,
    MultasModule,
    ReservasModule,
  ],
  exports: [
    LectoresModule,
    PrestamosModule,
    CategoriasModule,
    LibrosModule,
    AutoresModule,
    SedesModule,
    EjemplaresModule,
    MultasModule,
    ReservasModule,
  ],
})
export class BusinessModule {}
