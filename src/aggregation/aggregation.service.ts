import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/database/prisma.service';
import { ProvidersService } from '../providers/providers.service';
import { Decimal } from '@prisma/client/runtime/library';
import {
  normalizeProviderData,
  type NormalizedProduct,
} from './provider-adapters';

@Injectable()
export class AggregationService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private providersService: ProvidersService,
  ) {}

  async aggregateAllProviders() {
    const providerUrls = await this.providersService.getProviderUrls();
    const results = [];

    for (const [providerId, url] of Object.entries(providerUrls)) {
      try {
        const rawData = await this.providersService.fetchFromProvider(
          url,
          providerId,
        );

        // Use provider-specific adapter to normalize data
        const normalizedProducts = normalizeProviderData(providerId, rawData);

        const processed = await this.processProviderProducts(
          normalizedProducts,
          providerId,
        );
        results.push({ providerId, success: true, count: processed.length });
      } catch (error) {
        console.error(`Failed to process provider ${providerId}:`, error);
        results.push({
          providerId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  private async processProviderProducts(
    products: NormalizedProduct[],
    providerId: string,
  ) {
    const processed = [];

    for (const product of products) {
      try {
        const existingProduct = await this.prisma.product.findUnique({
          where: {
            externalId_providerId: {
              externalId: product.id,
              providerId,
            },
          },
        });

        const productData = {
          externalId: product.id,
          providerId,
          name: product.name,
          description: product.description,
          price: product.price,
          currency: product.currency,
          availability: product.availability,
          lastUpdated: new Date(product.lastUpdated),
        };

        if (existingProduct) {
          // Check for price changes
          if (!existingProduct.price.equals(new Decimal(productData.price))) {
            await this.prisma.priceHistory.create({
              data: {
                productId: existingProduct.id,
                oldPrice: existingProduct.price,
                newPrice: productData.price,
                oldAvailability: existingProduct.availability,
                newAvailability: productData.availability,
                currency: productData.currency,
                changeType: 'price_change',
              },
            });
          }

          await this.prisma.product.update({
            where: { id: existingProduct.id },
            data: productData,
          });
        } else {
          await this.prisma.product.create({
            data: productData,
          });
        }

        processed.push(product);
      } catch (error) {
        console.error(
          `Error processing product ${(product as { id: string }).id}:`,
          error,
        );
      }
    }

    return processed;
  }
}
