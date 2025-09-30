import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AggregationService } from './aggregation.service';

@Injectable()
export class SchedulerService {
  constructor(
    private configService: ConfigService,
    private aggregationService: AggregationService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleAggregation() {
    try {
      console.log('Starting scheduled aggregation...');
      const results = await this.aggregationService.aggregateAllProviders();
      console.log('Aggregation completed:', results);
    } catch (error) {
      console.error('Scheduled aggregation failed:', error);
    }
  }
}
