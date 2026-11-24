import { Module } from '@nestjs/common';
import { AutoresService } from './application/use-cases/autores.service';
import { AutoresController } from './presentation/controllers/autores.controller';

@Module({
  controllers: [AutoresController],
  providers: [AutoresService],
  exports: [AutoresService],
})
export class AutoresModule {}
