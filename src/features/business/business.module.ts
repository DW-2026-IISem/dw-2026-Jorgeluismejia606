import { Module } from '@nestjs/common';
import { LectoresModule } from './lectores/lectores.module';
import { PrestamosModule } from './prestamos/prestamos.module';

@Module({
  imports: [LectoresModule, PrestamosModule],
  exports: [LectoresModule, PrestamosModule],
})
export class BusinessModule {}
