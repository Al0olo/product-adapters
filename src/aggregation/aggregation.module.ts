import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '../common/database/database.module';
import { ProvidersModule } from '../providers/providers.module';
import { AggregationService } from './aggregation.service';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    ProvidersModule,
  ],
  providers: [AggregationService, SchedulerService],
  exports: [AggregationService],
})
export class AggregationModule {}
