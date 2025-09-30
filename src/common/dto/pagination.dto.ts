import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiProperty({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Sort field',
    required: false,
    enum: ['name', 'price', 'lastUpdated', 'createdAt'],
  })
  @IsOptional()
  sortBy?: 'name' | 'price' | 'lastUpdated' | 'createdAt' = 'lastUpdated';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class CursorPaginationQueryDto {
  @ApiProperty({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsPositive()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Cursor for pagination (last item ID from previous page)',
    required: false,
  })
  @IsOptional()
  cursor?: string;

  @ApiProperty({
    description: 'Sort field',
    required: false,
    enum: ['name', 'price', 'lastUpdated', 'createdAt'],
  })
  @IsOptional()
  sortBy?: 'name' | 'price' | 'lastUpdated' | 'createdAt' = 'lastUpdated';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page number' })
  page!: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit!: number;

  @ApiProperty({ description: 'Total number of items' })
  total!: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages!: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage!: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage!: boolean;

  @ApiProperty({ description: 'Next page number', required: false })
  nextPage?: number;

  @ApiProperty({ description: 'Previous page number', required: false })
  previousPage?: number;
}

export class CursorPaginationMetaDto {
  @ApiProperty({ description: 'Number of items per page' })
  limit!: number;

  @ApiProperty({ description: 'Total number of items' })
  total!: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage!: boolean;

  @ApiProperty({ description: 'Next cursor for pagination', required: false })
  nextCursor?: string;

  @ApiProperty({ description: 'Current cursor', required: false })
  currentCursor?: string;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items' })
  data!: T[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta!: PaginationMetaDto;
}

export class CursorPaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array of items' })
  data!: T[];

  @ApiProperty({ description: 'Cursor pagination metadata' })
  meta!: CursorPaginationMetaDto;
}
