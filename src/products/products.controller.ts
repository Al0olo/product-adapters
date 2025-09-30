import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('changes/recent')
  @ApiOperation({ summary: 'Get products with recent changes' })
  @ApiResponse({ status: 200, description: 'Recent changes retrieved successfully' })
  findRecentChanges(@Query('hours') hours?: string) {
    const hoursNumber = hours ? parseInt(hours, 10) : 24;
    return this.productsService.findRecentChanges(hoursNumber);
  }
}
