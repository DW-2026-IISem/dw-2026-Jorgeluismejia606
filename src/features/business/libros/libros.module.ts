import { Module } from '@nestjs/common';
import { LibrosController } from './presentation/controllers/libros.controller';
import { LibrosService } from './application/use-cases/libros.service';

@Module({
  controllers: [LibrosController],
  providers: [LibrosService],
  exports: [LibrosService],
})
export class LibrosModule {}
