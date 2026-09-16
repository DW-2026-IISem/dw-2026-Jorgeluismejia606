import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EstadoMulta } from '../../../../../../common/enums';
import { PrestamoModel } from '../../../../prestamos/infrastructure/persistence/models/prestamo.model';

@Table({ tableName: 'multas' })
export class MultaModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => PrestamoModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare prestamo_id: number;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare descripcion: string;

  @Column({ type: DataType.FLOAT, allowNull: false })
  declare monto: number;

  @Column({
    type: DataType.ENUM(...Object.values(EstadoMulta)),
    allowNull: false,
    defaultValue: EstadoMulta.PENDIENTE,
  })
  declare estado: EstadoMulta;

  @Column({ type: DataType.DATE, allowNull: false })
  declare fecha_generacion: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare fecha_pago: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare is_active: boolean;

  @BelongsTo(() => PrestamoModel)
  declare prestamo: PrestamoModel;
}
