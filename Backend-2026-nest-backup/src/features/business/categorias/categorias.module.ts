import { Module } from '@nestjs/common';
import { CategoriasController } from './presentation/controllers/categorias.controller';
import { CategoriasService } from './application/use-cases/categorias.service';

@Module({
  controllers: [CategoriasController],
  providers: [CategoriasService],
  exports: [CategoriasService],
})
export class CategoriasModule {}
