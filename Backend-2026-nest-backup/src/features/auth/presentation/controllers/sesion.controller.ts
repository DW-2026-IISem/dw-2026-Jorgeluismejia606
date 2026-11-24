import { Controller, Post, Get, Body, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiUnauthorizedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../../application/use-cases/auth.service';
import { SesionLoginDto } from '../dto/sesion-login.dto';
import { SesionLogoutDto, SesionRefreshDto } from '../dto/sesion-refresh.dto';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RawResponse } from '../../infrastructure/decorators/raw-response.decorator';

@ApiTags('Sesión')
@RawResponse()
@Controller('sesion')
export class SesionController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con usuario o correo (abierto)' })
  @ApiOkResponse({ description: 'access_token, refresh_token y tiempos de expiración (HTTP 200)' })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas (HTTP 401)' })
  login(@Body() dto: SesionLoginDto) {
    return this.authService.sesionLogin(dto);
  }

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perfil del usuario autenticado (JWT)' })
  perfil(@Req() req: { user: { sub: number } }) {
    return this.authService.perfil(req.user.sub);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar el par de tokens con rotación (abierto, refresh en el cuerpo)' })
  @ApiOkResponse({ description: 'Nuevo par de tokens; el refresh anterior deja de servir (HTTP 200)' })
  @ApiUnauthorizedResponse({ description: 'Refresh inválido, expirado o ya rotado (HTTP 401)' })
  refresh(@Body() dto: SesionRefreshDto) {
    return this.authService.sesionRefresh(dto.refresh_token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión: revoca el refresh presentado (idempotente)' })
  @ApiOkResponse({ description: '{ message } siempre, aunque el token ya no sirva (HTTP 200)' })
  logout(@Body() dto: SesionLogoutDto) {
    return this.authService.sesionLogout(dto.refresh_token);
  }
}
