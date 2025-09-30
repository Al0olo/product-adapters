import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AggregationService } from './aggregation.service';
import { PrismaService } from '../common/database/prisma.service';
import { ProvidersService } from '../providers/providers.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('AggregationService', () => {
  let service: AggregationService;
  let prismaService: PrismaService;
  let providersService: ProvidersService;

  const mockProviderUrls = {
    provider1: 'http://provider-1:3001',
    provider2: 'http://provider-2:3002',
    provider3: 'http://provider-3:3003',
  };

  // Mock raw provider data with different structures
  const mockProvider1Data = {
    metadata: { provider: 'Test', version: '1.0', timestamp: '2025-09-30T10:00:00Z' },
    catalog: {
      items: [
        {
          product_id: 'ext-1',
          product_name: 'Test Product 1',
          product_desc: 'Description 1',
          pricing: { amount: 99.99, currency_code: 'USD' },
          stock: { in_stock: true, quantity: 10 },
          last_modified: '2025-09-30T10:00:00Z',
        },
      ],
    },
  };

  const mockProvider2Data = [
    {
      itemId: 'ext-2',
      title: 'Test Product 2',
      details: 'Description 2',
      cost: 149.99,
      currencyType: 'USD',
      isAvailable: true,
      updatedAt: '2025-09-30T10:00:00Z',
    },
  ];

  const mockExistingProduct = {
    id: 'db-1',
    externalId: 'ext-1',
    providerId: 'provider-1',
    name: 'Test Product 1',
    description: 'Description 1',
    price: new Decimal(89.99),
    currency: 'USD',
    availability: true,
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isStale: false,
  };

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    priceHistory: {
      create: jest.fn(),
    },
  };

  const mockProvidersService = {
    getProviderUrls: jest.fn(),
    fetchFromProvider: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AggregationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ProvidersService,
          useValue: mockProvidersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AggregationService>(AggregationService);
    prismaService = module.get<PrismaService>(PrismaService);
    providersService = module.get<ProvidersService>(ProvidersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('aggregateAllProviders', () => {
    it('should aggregate data from all providers with different structures successfully', async () => {
      mockProvidersService.getProviderUrls.mockResolvedValue(mockProviderUrls);
      mockProvidersService.fetchFromProvider
        .mockResolvedValueOnce(mockProvider1Data) // Provider 1: nested structure
        .mockResolvedValueOnce(mockProvider2Data) // Provider 2: flat array
        .mockResolvedValueOnce({ success: true, count: 1, data: [
          { ID: 'ext-3', NAME: 'Test 3', DESCRIPTION: 'Desc 3', PRICE: 199.99, CURRENCY: 'USD', AVAILABLE: true, LAST_UPDATE: '2025-09-30T10:00:00Z' }
        ]}); // Provider 3: wrapped structure
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue(mockExistingProduct);

      const result = await service.aggregateAllProviders();

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('providerId', 'provider1');
      expect(result[0]).toHaveProperty('success', true);
      expect(result[0]).toHaveProperty('count', 1);
      expect(result[1]).toHaveProperty('count', 1);
      expect(result[2]).toHaveProperty('count', 1);
      expect(providersService.getProviderUrls).toHaveBeenCalled();
      expect(providersService.fetchFromProvider).toHaveBeenCalledTimes(3);
    });

    it('should handle provider failures gracefully', async () => {
      mockProvidersService.getProviderUrls.mockResolvedValue(mockProviderUrls);
      mockProvidersService.fetchFromProvider.mockRejectedValue(
        new Error('Network error'),
      );

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      const result = await service.aggregateAllProviders();

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('success', false);
      expect(result[0]).toHaveProperty('error', 'Network error');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(3);

      consoleErrorSpy.mockRestore();
    });

    it('should handle mixed success and failure scenarios', async () => {
      mockProvidersService.getProviderUrls.mockResolvedValue(mockProviderUrls);
      mockProvidersService.fetchFromProvider
        .mockResolvedValueOnce(mockProvider1Data) // provider1 succeeds
        .mockRejectedValueOnce(new Error('Timeout')) // provider2 fails
        .mockResolvedValueOnce({ success: true, count: 1, data: [
          { ID: 'ext-3', NAME: 'Test 3', DESCRIPTION: 'Desc 3', PRICE: 199.99, CURRENCY: 'USD', AVAILABLE: true, LAST_UPDATE: '2025-09-30T10:00:00Z' }
        ]}); // provider3 succeeds

      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue(mockExistingProduct);

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      const result = await service.aggregateAllProviders();

      expect(result).toHaveLength(3);
      expect(result[0].success).toBe(true);
      expect(result[1].success).toBe(false);
      expect(result[2].success).toBe(true);

      consoleErrorSpy.mockRestore();
    });

    it('should create new products when they do not exist', async () => {
      mockProvidersService.getProviderUrls.mockResolvedValue({
        provider1: 'http://provider-1:3001',
      });
      mockProvidersService.fetchFromProvider.mockResolvedValue(mockProvider1Data);
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.create.mockResolvedValue(mockExistingProduct);

      await service.aggregateAllProviders();

      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          externalId: 'ext-1',
          providerId: 'provider1',
          name: 'Test Product 1',
          price: 99.99,
        }),
      });
    });

    it('should update existing products and create price history on price change', async () => {
      mockProvidersService.getProviderUrls.mockResolvedValue({
        provider1: 'http://provider-1:3001',
      });
      mockProvidersService.fetchFromProvider.mockResolvedValue(mockProvider1Data);
      mockPrismaService.product.findUnique.mockResolvedValue(
        mockExistingProduct,
      );
      mockPrismaService.product.update.mockResolvedValue({
        ...mockExistingProduct,
        price: new Decimal(99.99),
      });
      mockPrismaService.priceHistory.create.mockResolvedValue({
        id: 'ph-1',
        productId: 'db-1',
        oldPrice: new Decimal(89.99),
        newPrice: new Decimal(99.99),
        oldAvailability: true,
        newAvailability: true,
        currency: 'USD',
        changedAt: new Date(),
        changeType: 'price_change',
      });

      await service.aggregateAllProviders();

      expect(prismaService.priceHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          productId: 'db-1',
          oldPrice: expect.any(Decimal),
          newPrice: 99.99,
          currency: 'USD',
          changeType: 'price_change',
        }),
      });
      expect(prismaService.product.update).toHaveBeenCalled();
    });

    it('should not create price history when price has not changed', async () => {
      mockProvidersService.getProviderUrls.mockResolvedValue({
        provider1: 'http://provider-1:3001',
      });
      const samePriceData = {
        ...mockProvider1Data,
        catalog: {
          items: [{
            ...mockProvider1Data.catalog.items[0],
            pricing: { amount: 89.99, currency_code: 'USD' } // Same price as existing
          }]
        }
      };
      mockProvidersService.fetchFromProvider.mockResolvedValue(samePriceData);
      mockPrismaService.product.findUnique.mockResolvedValue(
        mockExistingProduct,
      );
      mockPrismaService.product.update.mockResolvedValue(mockExistingProduct);

      await service.aggregateAllProviders();

      expect(prismaService.priceHistory.create).not.toHaveBeenCalled();
      expect(prismaService.product.update).toHaveBeenCalled();
    });

    it('should handle empty product arrays from providers', async () => {
      mockProvidersService.getProviderUrls.mockResolvedValue({
        provider1: 'http://provider-1:3001',
      });
      const emptyData = { ...mockProvider1Data, catalog: { items: [] } };
      mockProvidersService.fetchFromProvider.mockResolvedValue(emptyData);

      const result = await service.aggregateAllProviders();

      expect(result[0].success).toBe(true);
      expect(result[0].count).toBe(0);
      expect(prismaService.product.create).not.toHaveBeenCalled();
    });

    it('should handle individual product processing errors', async () => {
      mockProvidersService.getProviderUrls.mockResolvedValue({
        provider1: 'http://provider-1:3001',
      });
      const multipleProducts = {
        ...mockProvider1Data,
        catalog: {
          items: [
            mockProvider1Data.catalog.items[0],
            { ...mockProvider1Data.catalog.items[0], product_id: 'ext-2' }
          ]
        }
      };
      mockProvidersService.fetchFromProvider.mockResolvedValue(multipleProducts);
      mockPrismaService.product.findUnique
        .mockResolvedValueOnce(null)
        .mockRejectedValueOnce(new Error('Database error'));
      mockPrismaService.product.create.mockResolvedValue(mockExistingProduct);

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      const result = await service.aggregateAllProviders();

      expect(result[0].success).toBe(true);
      expect(result[0].count).toBe(1); // Only one product processed successfully
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error processing product'),
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });
});

