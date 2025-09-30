import { Controller, Get, Param, Query, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductV1Dto } from '../common/dto/api.dto';
import {
  PaginationQueryDto,
  PaginatedResponseDto,
} from '../common/dto/pagination.dto';
import type { Product, PriceHistory } from '@prisma/client';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Version('1')
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: PaginatedResponseDto,
  })
  findAll(
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Product & { priceHistory: PriceHistory[] }>> {
    return this.productsService.findAll(pagination);
  }

  @Get('cursor')
  @Version('1')
  @ApiOperation({ summary: 'Get all products with cursor-based pagination' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully with cursor pagination',
  })
  findAllWithCursor(@Query() pagination: PaginationQueryDto) {
    return this.productsService.findAllWithCursor(pagination);
  }

  @Get(':id')
  @Version('1')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductV1Dto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(
    @Param('id') id: string,
  ): Promise<(Product & { priceHistory: PriceHistory[] }) | null> {
    return this.productsService.findOne(id);
  }

  @Get('changes/recent')
  @Version('1')
  @ApiOperation({ summary: 'Get products with recent changes' })
  @ApiResponse({
    status: 200,
    description: 'Recent changes retrieved successfully',
    type: PaginatedResponseDto,
  })
  findRecentChanges(
    @Query('hours') hours?: string,
    @Query() pagination?: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Product & { priceHistory: PriceHistory[] }>> {
    const hoursNumber = hours ? parseInt(hours, 10) : 24;
    return this.productsService.findRecentChanges(hoursNumber, pagination);
  }
}
