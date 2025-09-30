import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import type { Server } from 'http';

describe('Products Pagination (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/v1/products (GET)', () => {
    it('should return paginated products with default pagination', () => {
      return request(app.getHttpServer() as Server)
        .get('/v1/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.meta).toHaveProperty('page', 1);
          expect(res.body.meta).toHaveProperty('limit', 20);
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('totalPages');
          expect(res.body.meta).toHaveProperty('hasNextPage');
          expect(res.body.meta).toHaveProperty('hasPreviousPage');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return paginated products with custom pagination', () => {
      return request(app.getHttpServer() as Server)
        .get('/v1/products?page=2&limit=5&sortBy=name&sortOrder=asc')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.page).toBe(2);
          expect(res.body.meta.limit).toBe(5);
          expect(res.body.data.length).toBeLessThanOrEqual(5);
        });
    });

    it('should validate pagination parameters', () => {
      return request(app.getHttpServer() as Server)
        .get('/v1/products?page=0&limit=200')
        .expect(400);
    });
  });

  describe('/v1/products/cursor (GET)', () => {
    it('should return cursor-paginated products', () => {
      return request(app.getHttpServer() as Server)
        .get('/v1/products/cursor?limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.meta).toHaveProperty('limit', 10);
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('hasNextPage');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('/v2/products (GET)', () => {
    it('should return paginated products with enhanced v2 data', () => {
      return request(app.getHttpServer() as Server)
        .get('/v2/products?page=1&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.data.length).toBeLessThanOrEqual(5);

          if (res.body.data.length > 0) {
            const product = res.body.data[0];
            expect(product).toHaveProperty('priceHistoryCount');
            expect(product).toHaveProperty('lastPriceChange');
            expect(product).toHaveProperty('priceChangePercentage');
          }
        });
    });
  });

  describe('/v1/products/changes/recent (GET)', () => {
    it('should return paginated recent changes', () => {
      return request(app.getHttpServer() as Server)
        .get('/v1/products/changes/recent?hours=24&page=1&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(res.body.meta.page).toBe(1);
          expect(res.body.meta.limit).toBe(10);
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });
});
