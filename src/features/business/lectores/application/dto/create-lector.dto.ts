import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLectorDto {
  @ApiProperty({ example: 'Carlos Rodríguez' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({ example: 'Estudiante de Derecho' })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
