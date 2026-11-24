import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../../application/use-cases/auth.service';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RawResponse } from '../../infrastructure/decorators/raw-response.decorator';

@ApiTags('Permisos')
@RawResponse()
@Controller('permisos')
export class PermisosController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Permisos efectivos del usuario autenticado (JWT)' })
  permisos(@Req() req: { user: { rol: string } }) {
    return this.authService.permisosEfectivos(req.user.rol);
  }
}
