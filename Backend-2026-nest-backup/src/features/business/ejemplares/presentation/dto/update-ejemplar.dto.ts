import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoEjemplar } from '@/common/enums';
import { ESTADOS_MANUALES } from './create-ejemplar.dto';

/** Sin is_active: la baja lógica va por PATCH /:id/deactivate. */
export class UpdateEjemplarDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  libro_id?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  sede_id?: number;

  @ApiPropertyOptional({ example: 'Beloved · Copia 3' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre?: string;

  @ApiPropertyOptional({ example: 'Encuadernación reparada' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string;

  @ApiPropertyOptional({ enum: ESTADOS_MANUALES, example: EstadoEjemplar.MANTENIMIENTO })
  @IsOptional()
  @IsIn(ESTADOS_MANUALES, { message: `estado debe ser uno de: ${ESTADOS_MANUALES.join(', ')} (PRESTADO lo asigna el préstamo)` })
  estado?: EstadoEjemplar;
}
