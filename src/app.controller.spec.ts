import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './common/database/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  let prismaService: PrismaService;

  // Mock PrismaService
  const mockPrismaService = {
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    prismaService = app.get<PrismaService>(PrismaService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return healthy status', async () => {
      const result = await appController.getHealth();
      
      expect(result.status).toBe('healthy');
      expect(result.database).toBe('connected');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should return unhealthy status when database is down', async () => {
      mockPrismaService.$queryRaw.mockRejectedValueOnce(new Error('Database error'));
      
      const result = await appController.getHealth();
      
      expect(result.status).toBe('unhealthy');
      expect(result.database).toBe('disconnected');
      expect(result.error).toBeDefined();
    });
  });

  describe('ready', () => {
    it('should return ready status', async () => {
      const result = await appController.getReady();
      
      expect(result.status).toBe('ready');
      expect(result.services.database).toBe('ready');
      expect(result.services.application).toBe('ready');
      expect(result).toHaveProperty('timestamp');
      expect(prismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should return not ready status when database is down', async () => {
      mockPrismaService.$queryRaw.mockRejectedValueOnce(new Error('Database error'));
      
      const result = await appController.getReady();
      
      expect(result.status).toBe('not ready');
      expect(result.services.database).toBe('not ready');
      expect(result.services.application).toBe('ready');
      expect(result.error).toBeDefined();
    });
  });
});
