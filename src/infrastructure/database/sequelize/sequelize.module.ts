import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize-typescript';
import { getSequelizeOptions } from './sequelize.options';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SEQUELIZE',
      useFactory: async (configService: ConfigService) => {
        const options = getSequelizeOptions(configService);
        const sequelize = new Sequelize(options);
        
        await sequelize.authenticate();
        // force: false, alter: false evita el DROP TABLE conflictivo en SQLite
        await sequelize.sync({ force: false, alter: false });
        return sequelize;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SEQUELIZE'],
})
export class SequelizeDatabaseModule {}
