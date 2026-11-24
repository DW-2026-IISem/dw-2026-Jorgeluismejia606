import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

/** Multa manual. Las de retraso, daño o pérdida las crea devolver(). */
export class CreateMultaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  prestamo_id: number;

  @ApiProperty({ example: 'Libro subrayado' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @ApiPropertyOptional({ example: 'Subrayado con marcador en el capítulo 3' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsPositive()
  monto: number;
}
