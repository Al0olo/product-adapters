import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/database/prisma.service';
import type { Provider, Prisma } from '@prisma/client';

@Injectable()
export class ProvidersService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async findAll(): Promise<Provider[]> {
    return this.prisma.provider.findMany({
      orderBy: { name: 'asc' },
    } satisfies Prisma.ProviderFindManyArgs);
  }

  async getProviderUrls(): Promise<Record<string, string>> {
    return {
      provider1:
        this.configService.get<string>('providers.provider1.url') || '',
      provider2:
        this.configService.get<string>('providers.provider2.url') || '',
      provider3:
        this.configService.get<string>('providers.provider3.url') || '',
    };
  }

  async fetchFromProvider(url: string, providerId: string): Promise<unknown> {
    try {
      const response = await fetch(`${url}/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Return raw data - let the adapter handle normalization
      const data = (await response.json()) as unknown;
      return data;
    } catch (error) {
      console.error(`Error fetching from provider ${providerId}:`, error);
      throw error;
    }
  }
}
