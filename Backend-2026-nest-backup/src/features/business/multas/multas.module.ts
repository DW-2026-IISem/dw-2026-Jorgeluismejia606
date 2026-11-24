import { Module } from '@nestjs/common';
import { MultasService } from './application/use-cases/multas.service';
import { MultasController } from './presentation/controllers/multas.controller';

@Module({
  controllers: [MultasController],
  providers: [MultasService],
  exports: [MultasService],
})
export class MultasModule {}
