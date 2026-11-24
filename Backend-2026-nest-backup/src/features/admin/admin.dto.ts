import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const upper = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

// ───────────────────────── Usuarios ─────────────────────────

/** Alta: es el único momento en que viaja la contraseña. */
export class CreateUsuarioDto {
  @ApiProperty({ example: 'maria' })
  @IsString()
  @MinLength(3)
  @MaxLength(60)
  username: string;

  @ApiPropertyOptional({ example: 'María Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @ApiProperty({ example: 'maria@lecturaabierta.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Maria123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'BIBLIOTECARIO' })
  @Transform(upper)
  @IsString()
  @IsNotEmpty()
  rol: string;
}

/** Edición: sin password ni is_active (forbidNonWhitelisted responde 400 si llegan). */
export class UpdateUsuarioDto {
  @ApiPropertyOptional({ example: 'maria' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(60)
  username?: string;

  @ApiPropertyOptional({ example: 'María Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  nombre?: string;

  @ApiPropertyOptional({ example: 'maria@lecturaabierta.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'LECTOR', description: 'Cambiar el rol = la "asignación"' })
  @IsOptional()
  @Transform(upper)
  @IsString()
  @IsNotEmpty()
  rol?: string;
}

// ───────────────────────── Roles ─────────────────────────

export class RoleDto {
  @ApiProperty({ example: 'AUDITOR' })
  @Transform(upper)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  name: string;
}

// ───────────────────────── Recursos ─────────────────────────

export class CreateRecursoDto {
  @ApiProperty({ example: 'GET', enum: HTTP_METHODS })
  @Transform(upper)
  @IsIn(HTTP_METHODS)
  method: string;

  @ApiProperty({ example: '/api/libros/:id' })
  @IsString()
  @Matches(/^\/\S*$/, { message: 'path debe empezar por / y no tener espacios' })
  @MaxLength(200)
  path: string;

  @ApiPropertyOptional({ example: 'Ver libro' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}

export class UpdateRecursoDto {
  @ApiPropertyOptional({ example: 'GET', enum: HTTP_METHODS })
  @IsOptional()
  @Transform(upper)
  @IsIn(HTTP_METHODS)
  method?: string;

  @ApiPropertyOptional({ example: '/api/libros/:id' })
  @IsOptional()
  @IsString()
  @Matches(/^\/\S*$/, { message: 'path debe empezar por / y no tener espacios' })
  @MaxLength(200)
  path?: string;

  @ApiPropertyOptional({ example: 'Ver libro' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}

// ───────────────────────── Concesiones ─────────────────────────

export class ConcesionDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  role_id: number;

  @ApiProperty({ example: 35 })
  @IsInt()
  resource_id: number;
}
