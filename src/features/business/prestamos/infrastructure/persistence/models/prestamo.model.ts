import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EstadoPrestamo } from '../../../../../../common/enums';
import { LectorModel } from '../../../../lectores/infrastructure/persistence/models/lector.model';
import { EjemplarModel } from '../../../../ejemplares/infrastructure/persistence/models/ejemplar.model';

@Table({ tableName: 'prestamos' })
export class PrestamoModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => LectorModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare lector_id: number;

  @ForeignKey(() => EjemplarModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare ejemplar_id: number;

  @Column({ type: DataType.DATE, allowNull: false })
  declare fecha_inicio: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  declare fecha_fin: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare fecha_devolucion: Date;

  @Column({ type: DataType.FLOAT, defaultValue: 0 })
  declare total: number;

  @Column({
    type: DataType.ENUM(...Object.values(EstadoPrestamo)),
    allowNull: false,
    defaultValue: EstadoPrestamo.ACTIVO,
  })
  declare estado: EstadoPrestamo;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare observaciones: string;

  @BelongsTo(() => LectorModel)
  declare lector: LectorModel;

  @BelongsTo(() => EjemplarModel)
  declare ejemplar: EjemplarModel;
}
