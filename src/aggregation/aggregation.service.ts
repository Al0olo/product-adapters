import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/database/prisma.service';
import { ProvidersService } from '../providers/providers.service';
import { Decimal } from '@prisma/client/runtime/library';

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
        const products = await this.providersService.fetchFromProvider(
          url,
          providerId,
        );
        const processed = await this.processProviderProducts(
          Array.isArray(products) ? products : [],
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
    products: unknown[],
    providerId: string,
  ) {
    const processed = [];

    for (const product of products) {
      try {
        const productObj = product as {
          id: string;
          name: string;
          description?: string;
          price: number;
          currency: string;
          availability: boolean;
          lastUpdated: string;
        };

        const existingProduct = await this.prisma.product.findUnique({
          where: {
            externalId_providerId: {
              externalId: productObj.id,
              providerId,
            },
          },
        });

        const productData = {
          externalId: productObj.id,
          providerId,
          name: productObj.name,
          description: productObj.description,
          price: productObj.price,
          currency: productObj.currency,
          availability: productObj.availability,
          lastUpdated: new Date(productObj.lastUpdated),
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
