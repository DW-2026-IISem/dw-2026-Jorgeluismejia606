import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { seedDemoCatalog } from './demo-catalog.seeder';
import { seedClients } from '../../../features/business/client/client.seeder';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'production') return;
    try {
      await seedDemoCatalog();
await seedClients(5);
    } catch (error: any) {
      this.logger.error(`❌ Error en seeders: ${error.message}`);
    }
  }
}
