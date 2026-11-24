import { Module } from '@nestjs/common';
import { PrestamosBusinessService } from './application/use-cases/prestamos.service';
import { PrestamosController } from './presentation/http/controllers/prestamos.controller';

@Module({
  controllers: [PrestamosController],
  providers: [PrestamosBusinessService],
  exports: [PrestamosBusinessService],
})
export class PrestamosModule {}
