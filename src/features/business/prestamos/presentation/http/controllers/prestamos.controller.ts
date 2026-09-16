import { Controller, Post, Body, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { PrestamosBusinessService } from '../../../application/use-cases/prestamos.service';
import { CreatePrestamoDto, DevolverPrestamoDto, RenovarPrestamoDto } from '../../../application/dto/prestamo.dto';
import { RolesGuard } from '../../../../../../common/guards/roles.guard';
import { Roles } from '../../../../../../common/decorators/roles.decorator';
import { Rol } from '../../../../../../common/enums';

@ApiTags('Préstamos')
@Controller('prestamos')
@UseGuards(RolesGuard)
export class PrestamosController {
  constructor(private readonly service: PrestamosBusinessService) {}

  @Post()
  @Roles(Rol.ADMIN, Rol.BIBLIOTECARIO)
  @ApiHeader({ name: 'x-user-role', description: 'Rol emulado (ej: BIBLIOTECARIO)' })
  @ApiOperation({ summary: 'Registrar un préstamo (Roles: ADMIN, BIBLIOTECARIO)' })
  crear(@Body() dto: CreatePrestamoDto) {
    return this.service.crear(dto);
  }

  @Patch(':id/devolver')
  @Roles(Rol.ADMIN, Rol.BIBLIOTECARIO)
  @ApiHeader({ name: 'x-user-role', description: 'Rol emulado (ej: BIBLIOTECARIO)' })
  @ApiOperation({ summary: 'Registrar devolución (Roles: ADMIN, BIBLIOTECARIO)' })
  devolver(@Param('id', ParseIntPipe) id: number, @Body() dto: DevolverPrestamoDto) {
    return this.service.devolver(id, dto);
  }

  @Patch(':id/renovar')
  @Roles(Rol.ADMIN, Rol.BIBLIOTECARIO, Rol.LECTOR)
  @ApiHeader({ name: 'x-user-role', description: 'Rol emulado (ej: LECTOR)' })
  @ApiOperation({ summary: 'Renovar préstamo (Roles: ADMIN, BIBLIOTECARIO, LECTOR)' })
  renovar(@Param('id', ParseIntPipe) id: number, @Body() dto: RenovarPrestamoDto) {
    return this.service.renovar(id, dto);
  }
}
