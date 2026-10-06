import { Module } from '@nestjs/common';
import { LectoresModule } from './lectores/lectores.module';
import { PrestamosModule } from './prestamos/prestamos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { LibrosModule } from './libros/libros.module';

@Module({
  imports: [
    LectoresModule,
    PrestamosModule,
    CategoriasModule,
    LibrosModule,
  ],
  exports: [
    LectoresModule,
    PrestamosModule,
    CategoriasModule,
    LibrosModule,
  ],
})
export class BusinessModule {}
