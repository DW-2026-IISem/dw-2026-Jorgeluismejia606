import { Controller, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrestamosBusinessService } from '../../../application/use-cases/prestamos.service';
import { CreatePrestamoDto, DevolverPrestamoDto, RenovarPrestamoDto } from '../../../application/dto/prestamo.dto';

@ApiTags('Préstamos')
@Controller('prestamos')
export class PrestamosController {
  constructor(private readonly service: PrestamosBusinessService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un préstamo (RF-07 / RN-01)' })
  crear(@Body() dto: CreatePrestamoDto) {
    return this.service.crear(dto);
  }

  @Patch(':id/devolver')
  @ApiOperation({ summary: 'Registrar devolución y liquidar multas (RF-08 / RN-06 / RN-08)' })
  devolver(@Param('id', ParseIntPipe) id: number, @Body() dto: DevolverPrestamoDto) {
    return this.service.devolver(id, dto);
  }

  @Patch(':id/renovar')
  @ApiOperation({ summary: 'Renovar plazo de préstamo (RF-09 / RN-05)' })
  renovar(@Param('id', ParseIntPipe) id: number, @Body() dto: RenovarPrestamoDto) {
    return this.service.renovar(id, dto);
  }
}
