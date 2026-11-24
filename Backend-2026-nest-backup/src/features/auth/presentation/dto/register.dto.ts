import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

/**
 * Registro público: NO acepta `rol`. Todo usuario autoregistrado es LECTOR;
 * los roles privilegiados solo se asignan desde /api/usuarios (ADMIN).
 */
export class RegisterDto {
  @ApiProperty({ example: 'Carlos Lector' })
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'lector@lecturaabierta.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123*' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
