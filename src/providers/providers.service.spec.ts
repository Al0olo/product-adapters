import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProvidersService } from './providers.service';
import { PrismaService } from '../common/database/prisma.service';

describe('ProvidersService', () => {
  let service: ProvidersService;
  let configService: ConfigService;
  let prismaService: PrismaService;

  const mockProviders = [
    {
      id: '1',
      name: 'Provider 1',
      url: 'http://provider-1:3001',
      isActive: true,
      lastFetchAt: new Date(),
      lastSuccessAt: new Date(),
      failureCount: 0,
      totalRequests: 100,
      successfulReqs: 98,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Provider 2',
      url: 'http://provider-2:3002',
      isActive: true,
      lastFetchAt: new Date(),
      lastSuccessAt: new Date(),
      failureCount: 2,
      totalRequests: 100,
      successfulReqs: 98,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockPrismaService = {
    provider: {
      findMany: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvidersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
    configService = module.get<ConfigService>(ConfigService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all providers sorted by name', async () => {
      mockPrismaService.provider.findMany.mockResolvedValue(mockProviders);

      const result = await service.findAll();

      expect(result).toEqual(mockProviders);
      expect(prismaService.provider.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array if no providers', async () => {
      mockPrismaService.provider.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('getProviderUrls', () => {
    it('should return all provider URLs from config', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        const config: Record<string, string> = {
          'providers.provider1.url': 'http://provider-1:3001',
          'providers.provider2.url': 'http://provider-2:3002',
          'providers.provider3.url': 'http://provider-3:3003',
        };
        return config[key] || '';
      });

      const result = await service.getProviderUrls();

      expect(result).toEqual({
        provider1: 'http://provider-1:3001',
        provider2: 'http://provider-2:3002',
        provider3: 'http://provider-3:3003',
      });
      expect(configService.get).toHaveBeenCalledTimes(3);
    });

    it('should return empty strings for undefined config values', async () => {
      mockConfigService.get.mockReturnValue(undefined);

      const result = await service.getProviderUrls();

      expect(result).toEqual({
        provider1: '',
        provider2: '',
        provider3: '',
      });
    });
  });

  describe('fetchFromProvider', () => {
    const mockProductsData = {
      products: [
        { id: '1', name: 'Product 1', price: 99.99 },
        { id: '2', name: 'Product 2', price: 149.99 },
      ],
    };

    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should fetch data from provider successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockProductsData),
      });

      const result = await service.fetchFromProvider(
        'http://provider-1:3001',
        'provider-1',
      );

      // Now returns raw data - adapter handles normalization
      expect(result).toEqual(mockProductsData);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://provider-1:3001/products',
      );
    });

    it('should return data directly regardless of structure', async () => {
      const directData = [
        { id: '1', name: 'Product 1', price: 99.99 },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(directData),
      });

      const result = await service.fetchFromProvider(
        'http://provider-1:3001',
        'provider-1',
      );

      // Returns raw data as-is
      expect(result).toEqual(directData);
    });

    it('should throw error when provider returns error status', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(
        service.fetchFromProvider('http://provider-1:3001', 'provider-1'),
      ).rejects.toThrow('HTTP error! status: 500');
    });

    it('should throw and log error on network failure', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation();

      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Network error'),
      );

      await expect(
        service.fetchFromProvider('http://provider-1:3001', 'provider-1'),
      ).rejects.toThrow('Network error');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching from provider provider-1:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle empty response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      const result = await service.fetchFromProvider(
        'http://provider-1:3001',
        'provider-1',
      );

      expect(result).toEqual({});
    });
  });
});

