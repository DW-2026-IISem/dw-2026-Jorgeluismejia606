import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '../../infrastructure/persistence/models/user.model';

export class RegisterDto {
  @ApiProperty({ example: 'Jorge Administrador' })
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'admin@lecturaabierta.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123*' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.LECTOR, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  rol?: UserRole;
}
