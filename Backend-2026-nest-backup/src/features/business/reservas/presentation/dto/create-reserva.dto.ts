import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReservaDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  lector_id: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  libro_id: number;

  @ApiProperty({ example: '2026-12-15T00:00:00Z', description: 'Hasta cuándo se mantiene la reserva' })
  @IsDateString()
  fecha_fin: string;

  @ApiPropertyOptional({ example: 'Avisar por correo cuando esté disponible' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  observaciones?: string;
}
