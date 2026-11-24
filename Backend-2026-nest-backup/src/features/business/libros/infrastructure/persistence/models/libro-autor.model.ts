import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement } from 'sequelize-typescript';

@Table({ tableName: 'libro_autores' })
export class LibroAutorModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare principal_id: number; // libro_id

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare relacionado_id: number; // autor_id

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare datos_relacion: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare is_active: boolean;
}
