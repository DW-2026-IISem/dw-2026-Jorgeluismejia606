import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

/** Sin estado ni préstamo: pagar y anular tienen sus propias rutas. */
export class UpdateMultaDto {
  @ApiPropertyOptional({ example: 'Libro subrayado' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre?: string;

  @ApiPropertyOptional({ example: 'Corrección del monto' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  monto?: number;
}
