import { Module } from '@nestjs/common';
import { LectoresModule } from './lectores/lectores.module';

@Module({
  imports: [LectoresModule],
  exports: [LectoresModule],
})
export class BusinessModule {}
