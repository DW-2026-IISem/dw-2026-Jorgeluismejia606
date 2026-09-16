import { Inject, Injectable } from '@nestjs/common';
import { LECTOR_REPOSITORY, ILectorRepository } from '../../domain/interfaces/lector-repository.interface';
import { Lector } from '../../domain/entities/lector.entity';
import { CreateLectorDto } from '../dto/create-lector.dto';

@Injectable()
export class CreateLectorUseCase {
  constructor(
    @Inject(LECTOR_REPOSITORY)
    private readonly lectorRepo: ILectorRepository,
  ) {}

  async execute(dto: CreateLectorDto): Promise<Lector> {
    const lector = new Lector({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
    });
    return this.lectorRepo.create(lector);
  }
}
