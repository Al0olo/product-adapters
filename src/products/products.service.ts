import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import {
  PaginationQueryDto,
  CursorPaginationQueryDto,
  PaginatedResponseDto,
  CursorPaginatedResponseDto,
} from '../common/dto/pagination.dto';
import type { Product, PriceHistory, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    pagination?: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<Product & { priceHistory: PriceHistory[] }>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const sortBy = pagination?.sortBy || 'lastUpdated';
    const sortOrder = pagination?.sortOrder || 'desc';

    // Calculate skip for offset-based pagination
    const skip = (page - 1) * limit;

    // Build orderBy clause
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    // Execute queries in parallel for better performance
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        orderBy,
        include: {
          priceHistory: {
            orderBy: { changedAt: 'desc' },
            take: 10,
          },
        },
      }),
      this.prisma.product.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page < totalPages ? page + 1 : undefined,
        previousPage: page > 1 ? page - 1 : undefined,
      },
    };
  }

  async findAllWithCursor(
    pagination?: CursorPaginationQueryDto,
  ): Promise<
    CursorPaginatedResponseDto<Product & { priceHistory: PriceHistory[] }>
  > {
    const limit = pagination?.limit || 20;
    const cursor = pagination?.cursor;
    const sortBy = pagination?.sortBy || 'lastUpdated';
    const sortOrder = pagination?.sortOrder || 'desc';

    // Build orderBy clause
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    // Build cursor condition
    const cursorCondition: Prisma.ProductWhereInput = {};
    if (cursor) {
      if (sortOrder === 'desc') {
        cursorCondition[sortBy] = { lt: cursor };
      } else {
        cursorCondition[sortBy] = { gt: cursor };
      }
    }

    // Execute queries in parallel
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        take: limit + 1, // Take one extra to check if there's a next page
        cursor: cursor ? { id: cursor } : undefined,
        where: cursorCondition,
        orderBy,
        include: {
          priceHistory: {
            orderBy: { changedAt: 'desc' },
            take: 10,
          },
        },
      }),
      this.prisma.product.count(),
    ]);

    // Check if there's a next page
    const hasNextPage = products.length > limit;
    if (hasNextPage) {
      products.pop(); // Remove the extra item
    }

    // Get the next cursor (ID of the last item)
    const nextCursor =
      hasNextPage && products.length > 0
        ? products[products.length - 1].id
        : undefined;

    return {
      data: products,
      meta: {
        limit,
        total,
        hasNextPage,
        nextCursor,
        currentCursor: cursor,
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        priceHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
    });
  }

  async findRecentChanges(hours: number = 24, pagination?: PaginationQueryDto) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 20;
    const sortBy = pagination?.sortBy || 'lastUpdated';
    const sortOrder = pagination?.sortOrder || 'desc';

    const skip = (page - 1) * limit;

    // Build orderBy clause
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: {
          lastUpdated: {
            gte: since,
          },
        },
        skip,
        take: limit,
        orderBy,
        include: {
          priceHistory: {
            where: {
              changedAt: {
                gte: since,
              },
            },
            orderBy: { changedAt: 'desc' },
          },
        },
      }),
      this.prisma.product.count({
        where: {
          lastUpdated: {
            gte: since,
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: products,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        nextPage: page < totalPages ? page + 1 : undefined,
        previousPage: page > 1 ? page - 1 : undefined,
      },
    };
  }
}
