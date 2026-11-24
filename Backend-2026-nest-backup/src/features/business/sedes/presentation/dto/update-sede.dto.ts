import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/** Sin is_active: el estado solo cambia con PATCH /:id/deactivate. */
export class UpdateSedeDto {
  @ApiPropertyOptional({ example: 'Sede Riohacha Centro' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ example: 'Biblioteca principal' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;
}
