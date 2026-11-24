import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

/** Sin estado: atender y cancelar tienen sus propias rutas. */
export class UpdateReservaDto {
  @ApiPropertyOptional({ example: '2026-12-20T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @ApiPropertyOptional({ example: 'Prefiere la sede norte' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  observaciones?: string;
}
