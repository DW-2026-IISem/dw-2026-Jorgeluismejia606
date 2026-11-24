import { Module } from '@nestjs/common';
import { SedesService } from './application/use-cases/sedes.service';
import { SedesController } from './presentation/controllers/sedes.controller';

@Module({
  controllers: [SedesController],
  providers: [SedesService],
  exports: [SedesService],
})
export class SedesModule {}
