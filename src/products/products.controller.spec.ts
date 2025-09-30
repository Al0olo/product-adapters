import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PaginationQueryDto } from '../common/dto/pagination.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProduct = {
    id: '1',
    externalId: 'ext-1',
    providerId: 'provider-1',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    currency: 'USD',
    availability: true,
    lastUpdated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isStale: false,
    priceHistory: [
      {
        id: 'ph-1',
        productId: '1',
        oldPrice: 89.99,
        newPrice: 99.99,
        oldAvailability: true,
        newAvailability: true,
        currency: 'USD',
        changedAt: new Date(),
        changeType: 'price_change',
      },
    ],
  };

  const mockPaginatedResponse = {
    data: [mockProduct],
    meta: {
      page: 1,
      limit: 20,
      total: 50,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false,
      nextPage: 2,
    },
  };

  const mockCursorPaginatedResponse = {
    data: [mockProduct],
    meta: {
      limit: 20,
      total: 50,
      hasNextPage: true,
      nextCursor: 'cursor-123',
      currentCursor: undefined,
    },
  };

  const mockProductsService = {
    findAll: jest.fn(),
    findAllWithCursor: jest.fn(),
    findOne: jest.fn(),
    findRecentChanges: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      mockProductsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const pagination: PaginationQueryDto = {
        page: 1,
        limit: 20,
      };

      const result = await controller.findAll(pagination);

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findAll).toHaveBeenCalledWith(pagination);
    });

    it('should handle custom pagination parameters', async () => {
      mockProductsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const pagination: PaginationQueryDto = {
        page: 2,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      };

      await controller.findAll(pagination);

      expect(service.findAll).toHaveBeenCalledWith(pagination);
    });
  });

  describe('findAllWithCursor', () => {
    it('should return cursor-paginated products', async () => {
      mockProductsService.findAllWithCursor.mockResolvedValue(
        mockCursorPaginatedResponse,
      );

      const pagination: PaginationQueryDto = {
        limit: 20,
      };

      const result = await controller.findAllWithCursor(pagination);

      expect(result).toEqual(mockCursorPaginatedResponse);
      expect(service.findAllWithCursor).toHaveBeenCalledWith(pagination);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockProduct);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });

    it('should return null if product not found', async () => {
      mockProductsService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('non-existent');

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith('non-existent');
    });
  });

  describe('findRecentChanges', () => {
    it('should return products with recent changes (default 24 hours)', async () => {
      mockProductsService.findRecentChanges.mockResolvedValue(
        mockPaginatedResponse,
      );

      const result = await controller.findRecentChanges();

      expect(result).toEqual(mockPaginatedResponse);
      expect(service.findRecentChanges).toHaveBeenCalledWith(24, undefined);
    });

    it('should respect custom hours parameter', async () => {
      mockProductsService.findRecentChanges.mockResolvedValue(
        mockPaginatedResponse,
      );

      await controller.findRecentChanges('48');

      expect(service.findRecentChanges).toHaveBeenCalledWith(48, undefined);
    });

    it('should support pagination', async () => {
      mockProductsService.findRecentChanges.mockResolvedValue(
        mockPaginatedResponse,
      );

      const pagination: PaginationQueryDto = {
        page: 2,
        limit: 10,
      };

      await controller.findRecentChanges('24', pagination);

      expect(service.findRecentChanges).toHaveBeenCalledWith(24, pagination);
    });

    it('should parse hours string to number', async () => {
      mockProductsService.findRecentChanges.mockResolvedValue(
        mockPaginatedResponse,
      );

      await controller.findRecentChanges('72');

      expect(service.findRecentChanges).toHaveBeenCalledWith(72, undefined);
    });
  });
});

