import { Lector } from '../entities/lector.entity';

export const LECTOR_REPOSITORY = 'LECTOR_REPOSITORY';

export interface ILectorRepository {
  create(lector: Lector): Promise<Lector>;
  findById(id: number): Promise<Lector | null>;
  findAll(): Promise<Lector[]>;
}
