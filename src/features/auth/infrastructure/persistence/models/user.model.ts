import { Table, Column, Model, DataType } from 'sequelize-typescript';

export enum UserRole {
  ADMIN = 'ADMIN',
  BIBLIOTECARIO = 'BIBLIOTECARIO',
  LECTOR = 'LECTOR',
}

@Table({
  tableName: 'usuarios',
  timestamps: true,
  underscored: true,
})
export class UserModel extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(120),
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare password_hash: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    defaultValue: UserRole.LECTOR,
  })
  declare rol: UserRole;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare refresh_token_hash: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare is_active: boolean;
}
