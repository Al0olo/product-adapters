import { Controller, Get, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { PrismaService } from './common/database/prisma.service';
import { HealthV1Dto, ReadyV1Dto } from './common/dto/api.dto';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ status: 200, description: 'Hello message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Version('1')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    type: HealthV1Dto,
  })
  @ApiResponse({
    status: 503,
    description: 'Service is unhealthy',
    type: HealthV1Dto,
  })
  async getHealth(): Promise<HealthV1Dto> {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('ready')
  @Version('1')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is ready',
    type: ReadyV1Dto,
  })
  @ApiResponse({
    status: 503,
    description: 'Service is not ready',
    type: ReadyV1Dto,
  })
  async getReady(): Promise<ReadyV1Dto> {
    try {
      // Check if all critical services are ready
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        services: {
          database: 'ready',
          application: 'ready',
        },
      };
    } catch (error) {
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        services: {
          database: 'not ready',
          application: 'ready',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
