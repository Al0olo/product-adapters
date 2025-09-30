import { Controller, Get, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProvidersService } from './providers.service';
import { ProviderV1Dto } from '../common/dto/api.dto';
import type { Provider } from '@prisma/client';

@ApiTags('providers')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get all providers' })
  @ApiResponse({
    status: 200,
    description: 'Providers retrieved successfully',
    type: [ProviderV1Dto],
  })
  findAll(): Promise<Provider[]> {
    return this.providersService.findAll();
  }

  @Get('urls')
  @Version('1')
  @ApiOperation({ summary: 'Get provider URLs' })
  @ApiResponse({
    status: 200,
    description: 'Provider URLs retrieved successfully',
  })
  getProviderUrls(): Promise<Record<string, string>> {
    return this.providersService.getProviderUrls();
  }
}
