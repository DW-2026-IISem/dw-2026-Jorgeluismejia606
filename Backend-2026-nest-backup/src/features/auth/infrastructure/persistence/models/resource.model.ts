import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'recursos',
  timestamps: true,
  underscored: true,
})
export class ResourceModel extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({ type: DataType.STRING(10), allowNull: false })
  declare method: string;

  @Column({ type: DataType.STRING(200), allowNull: false })
  declare path: string;

  @Column({ type: DataType.STRING(200), allowNull: true })
  declare description: string;
}
