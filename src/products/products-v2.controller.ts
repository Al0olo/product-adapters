import { Controller, Get, Param, Query, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ProductV2Dto } from '../common/dto/api.dto';
import {
  PaginationQueryDto,
  CursorPaginationQueryDto,
  PaginatedResponseDto,
  CursorPaginatedResponseDto,
} from '../common/dto/pagination.dto';
import type { Product, PriceHistory } from '@prisma/client';

@ApiTags('products')
@Controller('products')
export class ProductsV2Controller {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Version('2')
  @ApiOperation({
    summary: 'Get all products with enhanced data and pagination (v2)',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: PaginatedResponseDto,
  })
  async findAll(
    @Query() pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ProductV2Dto>> {
    const result = await this.productsService.findAll(pagination);

    // Enhance products with additional v2 data
    const enhancedData = result.data.map(
      (product: Product & { priceHistory: PriceHistory[] }) => ({
        ...product,
        price: Number(product.price),
        priceHistoryCount: product.priceHistory.length,
        lastPriceChange: product.priceHistory[0]?.changedAt,
        priceChangePercentage:
          product.priceHistory.length > 0
            ? ((Number(product.priceHistory[0].newPrice) -
                Number(product.priceHistory[0].oldPrice)) /
                Number(product.priceHistory[0].oldPrice)) *
              100
            : undefined,
      }),
    );

    return {
      data: enhancedData,
      meta: result.meta,
    };
  }

  @Get('cursor')
  @Version('2')
  @ApiOperation({
    summary:
      'Get all products with cursor-based pagination and enhanced data (v2)',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully with cursor pagination',
  })
  async findAllWithCursor(
    @Query() pagination: CursorPaginationQueryDto,
  ): Promise<CursorPaginatedResponseDto<ProductV2Dto>> {
    const result = await this.productsService.findAllWithCursor(pagination);

    // Enhance products with additional v2 data
    const enhancedData = result.data.map(
      (product: Product & { priceHistory: PriceHistory[] }) => ({
        ...product,
        price: Number(product.price),
        priceHistoryCount: product.priceHistory.length,
        lastPriceChange: product.priceHistory[0]?.changedAt,
        priceChangePercentage:
          product.priceHistory.length > 0
            ? ((Number(product.priceHistory[0].newPrice) -
                Number(product.priceHistory[0].oldPrice)) /
                Number(product.priceHistory[0].oldPrice)) *
              100
            : undefined,
      }),
    );

    return {
      data: enhancedData,
      meta: result.meta,
    };
  }

  @Get(':id')
  @Version('2')
  @ApiOperation({ summary: 'Get product by ID with enhanced data (v2)' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductV2Dto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string): Promise<ProductV2Dto | null> {
    const product = await this.productsService.findOne(id);

    if (!product) {
      return null;
    }

    // Enhance product with additional v2 data
    return {
      ...product,
      price: Number(product.price),
      priceHistoryCount: product.priceHistory.length,
      lastPriceChange: product.priceHistory[0]?.changedAt,
      priceChangePercentage:
        product.priceHistory.length > 0
          ? ((Number(product.priceHistory[0].newPrice) -
              Number(product.priceHistory[0].oldPrice)) /
              Number(product.priceHistory[0].oldPrice)) *
            100
          : undefined,
    };
  }

  @Get('changes/recent')
  @Version('2')
  @ApiOperation({
    summary:
      'Get products with recent changes and enhanced data with pagination (v2)',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent changes retrieved successfully',
    type: PaginatedResponseDto,
  })
  async findRecentChanges(
    @Query('hours') hours?: string,
    @Query() pagination?: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<ProductV2Dto>> {
    const hoursNumber = hours ? parseInt(hours, 10) : 24;
    const result = await this.productsService.findRecentChanges(
      hoursNumber,
      pagination,
    );

    // Enhance products with additional v2 data
    const enhancedData = result.data.map(
      (product: Product & { priceHistory: PriceHistory[] }) => ({
        ...product,
        price: Number(product.price),
        priceHistoryCount: product.priceHistory.length,
        lastPriceChange: product.priceHistory[0]?.changedAt,
        priceChangePercentage:
          product.priceHistory.length > 0
            ? ((Number(product.priceHistory[0].newPrice) -
                Number(product.priceHistory[0].oldPrice)) /
                Number(product.priceHistory[0].oldPrice)) *
              100
            : undefined,
      }),
    );

    return {
      data: enhancedData,
      meta: result.meta,
    };
  }
}
