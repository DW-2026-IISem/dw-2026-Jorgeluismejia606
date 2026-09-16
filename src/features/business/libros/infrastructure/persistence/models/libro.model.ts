import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { CategoriaModel } from '../../../categorias/infrastructure/persistence/models/categoria.model';

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

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare is_active: boolean;

  @HasMany(() => require('../../../ejemplares/infrastructure/persistence/models/ejemplar.model').EjemplarModel)
  declare ejemplares: unknown[];
}
