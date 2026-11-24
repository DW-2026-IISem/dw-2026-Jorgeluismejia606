import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSedeDto {
  @ApiProperty({ example: 'Sede Riohacha Centro' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @ApiPropertyOptional({ example: 'Biblioteca principal, calle 2' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;
}
