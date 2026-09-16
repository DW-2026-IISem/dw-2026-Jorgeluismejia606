import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class DatabaseSeederService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeederService.name);

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'production') return;
    try {
      this.logger.log('ℹ️ Verificando estado inicial de seeders...');
    } catch (error: any) {
      this.logger.error(`❌ Error en seeders: ${error.message}`);
    }
  }
}
