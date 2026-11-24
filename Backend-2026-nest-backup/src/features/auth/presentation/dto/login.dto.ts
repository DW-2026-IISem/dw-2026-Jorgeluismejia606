import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@lecturaabierta.com' })
  @IsEmail({}, { message: 'El correo debe ser un email válido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123*' })
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password: string;
}
