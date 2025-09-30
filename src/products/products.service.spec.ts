import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../common/database/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;

  const mockProducts = [
    {
      id: '1',
      externalId: 'ext-1',
      providerId: 'provider-1',
      name: 'Test Product 1',
      description: 'Description 1',
      price: 99.99,
      currency: 'USD',
      availability: true,
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isStale: false,
      priceHistory: [],
    },
    {
      id: '2',
      externalId: 'ext-2',
      providerId: 'provider-1',
      name: 'Test Product 2',
      description: 'Description 2',
      price: 149.99,
      currency: 'USD',
      availability: true,
      lastUpdated: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isStale: false,
      priceHistory: [],
    },
  ];

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products with default pagination', async () => {
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(50);

      const result = await service.findAll();

      expect(result.data).toEqual(mockProducts);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.total).toBe(50);
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(false);
      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should return paginated products with custom pagination', async () => {
      const pagination: PaginationQueryDto = {
        page: 2,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      };

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(50);

      const result = await service.findAll(pagination);

      expect(result.data).toEqual(mockProducts);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBe(50);
      expect(result.meta.totalPages).toBe(5);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);
      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
          orderBy: { name: 'asc' },
        }),
      );
    });

    it('should handle last page correctly', async () => {
      const pagination: PaginationQueryDto = {
        page: 3,
        limit: 20,
      };

      mockPrismaService.product.findMany.mockResolvedValue([mockProducts[0]]);
      mockPrismaService.product.count.mockResolvedValue(50);

      const result = await service.findAll(pagination);

      expect(result.meta.page).toBe(3);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPreviousPage).toBe(true);
      expect(result.meta.nextPage).toBeUndefined();
      expect(result.meta.previousPage).toBe(2);
    });
  });

  describe('findAllWithCursor', () => {
    it('should return cursor-paginated products', async () => {
      const products = [...mockProducts, { ...mockProducts[0], id: '3' }];
      mockPrismaService.product.findMany.mockResolvedValue(products);
      mockPrismaService.product.count.mockResolvedValue(50);

      const result = await service.findAllWithCursor({ limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.nextCursor).toBe('2');
      expect(result.meta.limit).toBe(2);
    });

    it('should handle no more pages', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProducts[0]]);
      mockPrismaService.product.count.mockResolvedValue(50);

      const result = await service.findAllWithCursor({ limit: 2 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.nextCursor).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProducts[0]);

      const result = await service.findOne('1');

      expect(result).toEqual(mockProducts[0]);
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          priceHistory: {
            orderBy: { changedAt: 'desc' },
          },
        },
      });
    });

    it('should return null if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      const result = await service.findOne('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findRecentChanges', () => {
    it('should return products with recent changes', async () => {
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(10);

      const result = await service.findRecentChanges(24);

      expect(result.data).toEqual(mockProducts);
      expect(result.meta.total).toBe(10);
      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            lastUpdated: expect.objectContaining({
              gte: expect.any(Date),
            }),
          },
        }),
      );
    });

    it('should respect custom hours parameter', async () => {
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(5);

      await service.findRecentChanges(48);

      const callArgs = mockPrismaService.product.findMany.mock.calls[0][0];
      const sinceDate = callArgs.where.lastUpdated.gte;
      const expectedDate = new Date(Date.now() - 48 * 60 * 60 * 1000);

      // Allow 1 second tolerance
      expect(Math.abs(sinceDate.getTime() - expectedDate.getTime())).toBeLessThan(1000);
    });

    it('should support pagination for recent changes', async () => {
      const pagination: PaginationQueryDto = {
        page: 2,
        limit: 5,
      };

      mockPrismaService.product.findMany.mockResolvedValue([mockProducts[0]]);
      mockPrismaService.product.count.mockResolvedValue(15);

      const result = await service.findRecentChanges(24, pagination);

      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.totalPages).toBe(3);
      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        }),
      );
    });
  });
});

