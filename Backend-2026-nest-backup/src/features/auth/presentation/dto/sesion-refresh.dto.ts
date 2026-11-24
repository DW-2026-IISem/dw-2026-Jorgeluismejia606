import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/** POST /api/sesion/refresh — snake_case, igual que la respuesta del login. */
export class SesionRefreshDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

/** POST /api/sesion/logout — opcional: cerrar sesión nunca debe fallar en el cliente. */
export class SesionLogoutDto {
  @ApiPropertyOptional({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsOptional()
  refresh_token?: string;
}
