import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        priceHistory: {
          orderBy: { changedAt: 'desc' },
          take: 10,
        },
      },
    });
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

  async findRecentChanges(hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return this.prisma.product.findMany({
      where: {
        lastUpdated: {
          gte: since,
        },
      },
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
    });
  }
}
