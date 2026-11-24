import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsInt } from 'class-validator';
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class UpdateLibroDto {
  @ApiProperty({ example: 'Cien Años de Soledad (Edición 2)', required: false })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ example: 'Actualización de notas', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  categoria_id?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiProperty({ example: [1, 2], required: false, description: 'IDs de autores: el primero queda como autor principal' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  autor_ids?: number[];
}
