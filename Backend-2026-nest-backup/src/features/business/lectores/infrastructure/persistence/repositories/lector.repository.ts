import { Injectable } from '@nestjs/common';
import { ILectorRepository } from '../../../domain/interfaces/lector-repository.interface';
import { Lector } from '../../../domain/entities/lector.entity';
import { LectorModel } from '../models/lector.model';

@Injectable()
export class LectorRepository implements ILectorRepository {
  async create(lector: Lector): Promise<Lector> {
    const model = await LectorModel.create({
      nombre: lector.nombre,
      descripcion: lector.descripcion,
      is_active: lector.isActive,
    });
    return new Lector({
      id: model.id,
      nombre: model.nombre,
      descripcion: model.descripcion,
      isActive: model.is_active,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  async findById(id: number): Promise<Lector | null> {
    const model = await LectorModel.findByPk(id);
    if (!model) return null;
    return new Lector({
      id: model.id,
      nombre: model.nombre,
      descripcion: model.descripcion,
      isActive: model.is_active,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  async findAll(): Promise<Lector[]> {
    const models = await LectorModel.findAll();
    return models.map((m) => new Lector({
      id: m.id,
      nombre: m.nombre,
      descripcion: m.descripcion,
      isActive: m.is_active,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));
  }
}
