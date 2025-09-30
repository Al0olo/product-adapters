import { Module } from '@nestjs/common';
import { DatabaseModule } from '../common/database/database.module';
import { ProvidersService } from './providers.service';

@Module({
  imports: [DatabaseModule],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}
