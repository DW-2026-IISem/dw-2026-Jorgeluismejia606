import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({ tableName: 'categorias' })
export class CategoriaModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare descripcion: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare is_active: boolean;
}
