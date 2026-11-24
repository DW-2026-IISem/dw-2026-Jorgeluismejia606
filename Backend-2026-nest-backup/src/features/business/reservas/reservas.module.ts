import { Module } from '@nestjs/common';
import { ReservasService } from './application/use-cases/reservas.service';
import { ReservasController } from './presentation/controllers/reservas.controller';

@Module({
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}
