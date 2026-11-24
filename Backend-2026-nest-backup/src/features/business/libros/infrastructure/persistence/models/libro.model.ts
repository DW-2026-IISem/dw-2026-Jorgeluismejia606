import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  HasMany,
} from 'sequelize-typescript';
import { EjemplarModel } from '../../../../ejemplares/infrastructure/persistence/models/ejemplar.model';
import { CategoriaModel } from '../../../../categorias/infrastructure/persistence/models/categoria.model';
import { AutorModel } from '../../../../autores/infrastructure/persistence/models/autor.model';
import { LibroAutorModel } from './libro-autor.model';

@Table({ tableName: 'libros' })
export class LibroModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.STRING(200), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare descripcion: string;

  @ForeignKey(() => CategoriaModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare categoria_id: number;

  @BelongsTo(() => CategoriaModel)
  declare categoria: CategoriaModel;

  @HasMany(() => EjemplarModel)
  declare ejemplares: EjemplarModel[];

  /**
   * Muchos a muchos con autores a través de `libro_autores`.
   * La pivote usa principal_id (= libro) y relacionado_id (= autor).
   */
  @BelongsToMany(() => AutorModel, () => LibroAutorModel, 'principal_id', 'relacionado_id')
  declare autores: AutorModel[];

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare is_active: boolean;
}
