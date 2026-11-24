import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/** Sin is_active: el estado solo cambia con PATCH /:id/deactivate. */
export class UpdateAutorDto {
  @ApiPropertyOptional({ example: 'Gabriel García Márquez' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(150)
  nombre?: string;

  @ApiPropertyOptional({ example: 'Novelista colombiano' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;
}
