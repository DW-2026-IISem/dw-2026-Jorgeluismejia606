import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EstadoReserva } from '../../../../../../common/enums';
import { LectorModel } from '../../../../lectores/infrastructure/persistence/models/lector.model';
import { LibroModel } from '../../../../libros/infrastructure/persistence/models/libro.model';

@Table({ tableName: 'reservas' })
export class ReservaModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => LectorModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare lector_id: number;

  @ForeignKey(() => LibroModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare libro_id: number;

  @Column({ type: DataType.DATE, allowNull: false })
  declare fecha_inicio: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  declare fecha_fin: Date;

  @Column({
    type: DataType.ENUM(...Object.values(EstadoReserva)),
    allowNull: false,
    defaultValue: EstadoReserva.PENDIENTE,
  })
  declare estado: EstadoReserva;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare observaciones: string;

  @BelongsTo(() => LectorModel)
  declare lector: LectorModel;

  @BelongsTo(() => LibroModel)
  declare libro: LibroModel;
}
