import { Body, Controller, Get, Post, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateLectorDto } from '../../../application/dto/create-lector.dto';
import { CreateLectorUseCase } from '../../../application/use-cases/create-lector.use-case';
import { LECTOR_REPOSITORY, ILectorRepository } from '../../../domain/interfaces/lector-repository.interface';

@ApiTags('Lectores')
@Controller('lectores')
export class LectoresController {
  constructor(
    private readonly createLectorUseCase: CreateLectorUseCase,
    @Inject(LECTOR_REPOSITORY)
    private readonly lectorRepo: ILectorRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un lector (RF-01)' })
  create(@Body() dto: CreateLectorDto) {
    return this.createLectorUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar lectores' })
  findAll() {
    return this.lectorRepo.findAll();
  }
}
