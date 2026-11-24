import { Module } from '@nestjs/common';
import { EjemplaresService } from './application/use-cases/ejemplares.service';
import { EjemplaresController } from './presentation/controllers/ejemplares.controller';

@Module({
  controllers: [EjemplaresController],
  providers: [EjemplaresService],
  exports: [EjemplaresService],
})
export class EjemplaresModule {}
