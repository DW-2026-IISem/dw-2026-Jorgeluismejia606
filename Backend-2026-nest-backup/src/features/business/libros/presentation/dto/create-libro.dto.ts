import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsInt } from 'class-validator';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLibroDto {
  @ApiProperty({ example: 'Cien Años de Soledad' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Edición conmemorativa', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  categoria_id: number;

  @ApiProperty({ example: [1, 2], required: false, description: 'IDs de autores: el primero queda como autor principal' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  autor_ids?: number[];
}
