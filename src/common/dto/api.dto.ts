import { ApiProperty } from '@nestjs/swagger';

export class ProductV1Dto {
  @ApiProperty({ description: 'Product ID' })
  id!: string;

  @ApiProperty({ description: 'External product ID from provider' })
  externalId!: string;

  @ApiProperty({ description: 'Provider ID' })
  providerId!: string;

  @ApiProperty({ description: 'Product name' })
  name!: string;

  @ApiProperty({ description: 'Product description', required: false })
  description?: string | null;

  @ApiProperty({ description: 'Product price' })
  price!: number | string;

  @ApiProperty({ description: 'Currency code', default: 'USD' })
  currency!: string;

  @ApiProperty({ description: 'Product availability', default: true })
  availability!: boolean;

  @ApiProperty({ description: 'Last updated timestamp' })
  lastUpdated!: Date;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Whether data is stale', default: false })
  isStale!: boolean;
}

export class ProductV2Dto extends ProductV1Dto {
  @ApiProperty({ description: 'Price history count' })
  priceHistoryCount!: number;

  @ApiProperty({ description: 'Last price change timestamp', required: false })
  lastPriceChange?: Date;

  @ApiProperty({ description: 'Price change percentage', required: false })
  priceChangePercentage?: number;
}

export class ProviderV1Dto {
  @ApiProperty({ description: 'Provider ID' })
  id!: string;

  @ApiProperty({ description: 'Provider name' })
  name!: string;

  @ApiProperty({ description: 'Provider URL' })
  url!: string;

  @ApiProperty({ description: 'Whether provider is active', default: true })
  isActive!: boolean;

  @ApiProperty({ description: 'Last fetch timestamp', required: false })
  lastFetchAt?: Date | null;

  @ApiProperty({
    description: 'Last successful fetch timestamp',
    required: false,
  })
  lastSuccessAt?: Date | null;

  @ApiProperty({ description: 'Failure count', default: 0 })
  failureCount!: number;

  @ApiProperty({ description: 'Total requests', default: 0 })
  totalRequests!: number;

  @ApiProperty({ description: 'Successful requests', default: 0 })
  successfulReqs!: number;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt!: Date;
}

export class ProviderV2Dto extends ProviderV1Dto {
  @ApiProperty({ description: 'Success rate percentage' })
  successRate!: number;

  @ApiProperty({
    description: 'Average response time in milliseconds',
    required: false,
  })
  averageResponseTime?: number;

  @ApiProperty({ description: 'Health status' })
  healthStatus!: 'healthy' | 'degraded' | 'unhealthy';
}

export class HealthV1Dto {
  @ApiProperty({ description: 'Health status' })
  status!: string;

  @ApiProperty({ description: 'Timestamp' })
  timestamp!: string;

  @ApiProperty({ description: 'Uptime in seconds' })
  uptime!: number;

  @ApiProperty({ description: 'Database connection status' })
  database!: string;

  @ApiProperty({ description: 'Error message', required: false })
  error?: string;
}

export class HealthV2Dto extends HealthV1Dto {
  @ApiProperty({ description: 'Memory usage in MB' })
  memoryUsage!: number;

  @ApiProperty({ description: 'CPU usage percentage' })
  cpuUsage!: number;

  @ApiProperty({ description: 'Active connections count' })
  activeConnections!: number;
}

export class ReadyV1Dto {
  @ApiProperty({ description: 'Readiness status' })
  status!: string;

  @ApiProperty({ description: 'Timestamp' })
  timestamp!: string;

  @ApiProperty({ description: 'Services status' })
  services!: {
    database: string;
    application: string;
  };

  @ApiProperty({ description: 'Error message', required: false })
  error?: string;
}

export class ReadyV2Dto extends ReadyV1Dto {
  @ApiProperty({ description: 'Services status with details' })
  declare services: {
    database: string;
    application: string;
    providers: string;
    aggregation: string;
  };
}
