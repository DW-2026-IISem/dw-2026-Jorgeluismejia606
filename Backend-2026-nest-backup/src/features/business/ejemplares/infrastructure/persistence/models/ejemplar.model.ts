import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { EstadoEjemplar } from '../../../../../../common/enums';
import { LibroModel } from '../../../../libros/infrastructure/persistence/models/libro.model';
import { SedeModel } from '../../../../sedes/infrastructure/persistence/models/sede.model';

@Table({ tableName: 'ejemplares' })
export class EjemplarModel extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => LibroModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare libro_id: number;

  @ForeignKey(() => SedeModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare sede_id: number;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare nombre: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare descripcion: string;

  @Column({
    type: DataType.ENUM(...Object.values(EstadoEjemplar)),
    allowNull: false,
    defaultValue: EstadoEjemplar.DISPONIBLE,
  })
  declare estado: EstadoEjemplar;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare is_active: boolean;

  @BelongsTo(() => LibroModel)
  declare libro: LibroModel;

  @BelongsTo(() => SedeModel)
  declare sede: SedeModel;
}
