import { Module } from '@nestjs/common';
import { LECTOR_REPOSITORY } from './domain/interfaces/lector-repository.interface';
import { LectorRepository } from './infrastructure/persistence/repositories/lector.repository';
import { CreateLectorUseCase } from './application/use-cases/create-lector.use-case';
import { LectoresController } from './presentation/http/controllers/lectores.controller';

@Module({
  controllers: [LectoresController],
  providers: [
    LectorRepository,
    { provide: LECTOR_REPOSITORY, useExisting: LectorRepository },
    CreateLectorUseCase,
  ],
  exports: [LECTOR_REPOSITORY],
})
export class LectoresModule {}
