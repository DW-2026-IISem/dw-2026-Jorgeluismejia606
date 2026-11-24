import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { RoleModel } from './role.model';
import { ResourceModel } from './resource.model';

@Table({
  tableName: 'roles_recursos',
  timestamps: false,
  underscored: true,
})
export class RoleResourceModel extends Model {
  @ForeignKey(() => RoleModel)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  declare role_id: number;

  @ForeignKey(() => ResourceModel)
  @Column({ type: DataType.INTEGER, primaryKey: true })
  declare resource_id: number;
}
