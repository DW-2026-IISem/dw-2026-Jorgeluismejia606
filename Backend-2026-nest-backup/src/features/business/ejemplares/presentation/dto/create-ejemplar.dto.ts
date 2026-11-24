import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { EstadoEjemplar } from '@/common/enums';

/** Estados que se pueden asignar a mano. PRESTADO solo lo pone el préstamo. */
export const ESTADOS_MANUALES = Object.values(EstadoEjemplar).filter(
  (estado) => estado !== EstadoEjemplar.PRESTADO,
);

export class CreateEjemplarDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  libro_id: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  sede_id: number;

  @ApiProperty({ example: 'Beloved · Copia 3' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre: string;

  @ApiPropertyOptional({ example: 'Tapa dura, buen estado' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;

  @ApiPropertyOptional({ enum: ESTADOS_MANUALES, example: EstadoEjemplar.DISPONIBLE })
  @IsOptional()
  @IsIn(ESTADOS_MANUALES, { message: `estado debe ser uno de: ${ESTADOS_MANUALES.join(', ')} (PRESTADO lo asigna el préstamo)` })
  estado?: EstadoEjemplar;
}
