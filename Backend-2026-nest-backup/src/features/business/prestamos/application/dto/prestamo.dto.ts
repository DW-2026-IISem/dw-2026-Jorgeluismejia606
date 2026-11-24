import { IsDateString, IsInt, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePrestamoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  lectorId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  ejemplarId: number;

  @ApiProperty({ example: '2026-11-30T00:00:00Z' })
  @IsDateString()
  fechaFin: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class DevolverPrestamoDto {
  @ApiProperty({ example: '2026-11-20T10:00:00Z' })
  @IsDateString()
  fechaDevolucion: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  danado?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  perdido?: boolean;
}

export class RenovarPrestamoDto {
  @ApiProperty({ example: '2026-12-15T00:00:00Z' })
  @IsDateString()
  nuevaFechaFin: string;
}
