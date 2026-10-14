import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { AuthService } from '../../application/use-cases/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiCreatedResponse({ description: 'Usuario creado exitosamente (HTTP 201)' })
  @ApiConflictResponse({ description: 'El correo ya se encuentra registrado (HTTP 409)' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión y obtener tokens (Access + Refresh)' })
  @ApiOkResponse({ description: 'Login exitoso: devuelve accessToken y refreshToken (HTTP 200)' })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas (HTTP 401)' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar Access Token mediante Refresh Token (rotación)' })
  @ApiOkResponse({ description: 'Nuevo par accessToken/refreshToken emitido (HTTP 200)' })
  @ApiForbiddenResponse({ description: 'Refresh token expirado, inválido o no reconocido (HTTP 403)' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto);
  }
}
