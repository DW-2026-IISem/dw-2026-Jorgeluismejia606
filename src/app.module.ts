import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/environment/env.validation';
import { SequelizeDatabaseModule } from './infrastructure/database/sequelize/sequelize.module';
import { SecurityModule } from './infrastructure/security/security.module';
import { BusinessModule } from './features/business/business.module';
import { AuthModule } from './features/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    SequelizeDatabaseModule,
    SecurityModule,
    AuthModule,
    BusinessModule,
  ],
})
export class AppModule {}
