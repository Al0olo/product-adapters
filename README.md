# Product Price Aggregator API

**Technical Assignment - Senior Backend Software Engineer**

> **Note**: This is a technical assignment solution demonstrating backend development skills with NestJS, Prisma, and PostgreSQL. The focus is on showcasing architecture, code quality, and best practices within the given timeframe (3-6 hours).

## 📋 Assignment Overview

**Objective**: Develop a Product Price Aggregation API that collects, processes, and serves pricing and availability data from multiple external APIs.

**Time Allocated**: ~4 hours (3-6 hours range)  
**Submission Deadline**: 24 hours from receipt  
**Stack**: NestJS (TypeScript), Prisma, PostgreSQL, Docker

---

## 🚀 Quick Start (One Command)

```bash
docker-compose up -d
```

This single command will:
✅ Start PostgreSQL database  
✅ Install all dependencies  
✅ Generate Prisma client  
✅ Push database schema automatically  
✅ Start 3 simulated provider APIs (50 products each)  
✅ Start the main NestJS application  

**Everything is ready in ~60 seconds!**

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Main API** | http://localhost:3000 | NestJS application |
| **Swagger API v1** | http://localhost:3000/api/v1 | API documentation (version 1) |
| **Swagger API v2** | http://localhost:3000/api/v2 | API documentation (version 2) |
| **Health Check** | http://localhost:3000/v1/health | Application health status |
| **Readiness Check** | http://localhost:3000/v1/ready | Service readiness probe |
| **Provider 1 API** | http://localhost:3001/products | Simulated external provider |
| **Provider 2 API** | http://localhost:3002/products | Simulated external provider |
| **Provider 3 API** | http://localhost:3003/products | Simulated external provider |

---

## 📚 API Endpoints

### **Products** (with Database-Level Pagination)

#### Version 1 (Offset-based Pagination)
```bash
# Get all products with pagination
GET /v1/products?page=1&limit=20&sortBy=lastUpdated&sortOrder=desc

# Get all products with cursor pagination (better performance)
GET /v1/products/cursor?limit=20&cursor=uuid&sortBy=name&sortOrder=asc

# Get single product with price history
GET /v1/products/:id

# Get products with recent price/availability changes
GET /v1/products/changes/recent?hours=24&page=1&limit=10
```

#### Version 2 (Enhanced with Analytics)
```bash
# Get products with price history analytics and pagination
GET /v2/products?page=1&limit=20&sortBy=price&sortOrder=asc

# Cursor-based pagination with analytics
GET /v2/products/cursor?limit=20&cursor=uuid

# Get single product with enhanced data
GET /v2/products/:id

# Recent changes with analytics
GET /v2/products/changes/recent?hours=48&page=1&limit=15
```

### **Providers**

```bash
# Get all providers with metrics
GET /v1/providers

# Get provider URLs configuration
GET /v1/providers/urls
```

### **Real-Time Updates** (SSE)

```bash
# Server-Sent Events stream for product updates
GET /v1/stream/products
```

### **Health & Monitoring**

```bash
# Application health status
GET /v1/health

# Kubernetes-ready readiness probe
GET /v1/ready
```

### **Pagination Parameters**

**Offset-based Pagination:**
- `page`: Page number (1-based, default: 1)
- `limit`: Items per page (1-100, default: 20)
- `sortBy`: Field to sort by (`name`, `price`, `lastUpdated`, `createdAt`)
- `sortOrder`: Sort direction (`asc`, `desc`)

**Cursor-based Pagination:**
- `limit`: Items per page (1-100, default: 20)
- `cursor`: Last item ID from previous page
- `sortBy`: Field to sort by
- `sortOrder`: Sort direction

**Response Format:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "nextPage": 2
  }
}
```

---

## ✅ Assignment Requirements Checklist

### **Functional Requirements**

- ✅ **External Provider Simulation**: 3 simulated APIs serving 50 products each
- ✅ **Real-Time Data Collection**: Periodic fetching with concurrent processing
- ✅ **Data Normalization**: Consistent format across providers
- ✅ **Efficient Data Storage**: Prisma with PostgreSQL, optimized upserts
- ✅ **Data Freshness**: Stale data detection mechanism
- ✅ **Price History Tracking**: Complete audit trail with timestamps
- ✅ **RESTful API Endpoints**: All required endpoints implemented
- ✅ **Database-Level Pagination**: Offset and cursor-based with validation
- ✅ **Concurrency Handling**: Async/await with Promise.allSettled
- ✅ **Error Handling**: Circuit breaker pattern, graceful degradation
- ✅ **Real-Time Visualization**: SSE endpoint (HTML page optional)

### **Non-Functional Requirements**

- ✅ **RESTful API Design**: Proper HTTP methods and status codes
- ✅ **API Versioning**: URI-based versioning (v1, v2)
- ✅ **Configuration Management**: Environment variables with validation (Zod)
- ✅ **Code Quality**: SOLID principles, TypeScript strict mode, clean architecture
- ✅ **Testing**: E2E tests for critical flows (pagination, endpoints)
- ✅ **Swagger Documentation**: Integrated with versioned docs
- ✅ **Docker Setup**: Complete docker-compose for one-command deployment
- ✅ **Monitoring**: Health checks, readiness probes, structured logging

---

## 🏗️ Architecture & Design Decisions

### **Technology Choices**

1. **NestJS**: Enterprise-grade framework with dependency injection
2. **Prisma**: Type-safe ORM with excellent TypeScript support
3. **PostgreSQL**: Robust relational database for complex queries
4. **Docker Compose**: One-command setup for reviewers

### **Design Patterns Implemented**

1. **Repository Pattern**: Clean separation between data and business logic
2. **Service Layer Pattern**: Business logic isolation
3. **Factory Pattern**: For creating provider instances
4. **Observer Pattern**: For event-driven updates (SSE)
5. **Circuit Breaker**: Fault tolerance for external APIs
6. **Dependency Injection**: Throughout the application

### **Database Optimization**

```prisma
// Key indexes for pagination performance
@@index([lastUpdated])
@@index([createdAt])
@@index([name])
@@index([price, currency])
@@index([providerId, availability])
@@index([lastUpdated, createdAt]) // Composite for sorting
```

### **Pagination Strategy**

**Why Both Offset and Cursor?**
- **Offset**: Simple, familiar, good for small-medium datasets
- **Cursor**: Consistent performance, no skipped/duplicate items, scalable

**Database-Level Implementation:**
```typescript
// Offset-based (using Prisma skip/take)
const skip = (page - 1) * limit;
await prisma.product.findMany({ skip, take: limit });

// Cursor-based (using Prisma cursor)
await prisma.product.findMany({ 
  cursor: { id: lastId },
  take: limit + 1 
});
```

### **Concurrent Data Fetching**

```typescript
// Parallel fetching from all providers
const results = await Promise.allSettled(
  providers.map(provider => fetchFromProvider(provider))
);
```

### **API Versioning Strategy**

- **v1**: Core functionality with pagination
- **v2**: Enhanced with price history analytics
- Future versions can be added without breaking existing clients

---

## 🗄️ Database Schema

```prisma
model Product {
  id              String           @id @default(uuid())
  externalId      String
  providerId      String
  name            String
  description     String?
  price           Decimal          @db.Decimal(10, 2)
  currency        String           @default("USD")
  availability    Boolean          @default(true)
  lastUpdated     DateTime         @default(now())
  isStale         Boolean          @default(false)
  priceHistory    PriceHistory[]
  
  @@unique([externalId, providerId])
  // Multiple indexes for performance
}

model PriceHistory {
  id              String   @id @default(uuid())
  productId       String
  product         Product  @relation(fields: [productId], references: [id])
  oldPrice        Decimal  @db.Decimal(10, 2)
  newPrice        Decimal  @db.Decimal(10, 2)
  oldAvailability Boolean?
  newAvailability Boolean?
  currency        String
  changedAt       DateTime @default(now())
  changeType      String
  
  @@index([productId, changedAt(sort: Desc)])
}

model Provider {
  id              String    @id @default(uuid())
  name            String    @unique
  url             String
  isActive        Boolean   @default(true)
  lastFetchAt     DateTime?
  lastSuccessAt   DateTime?
  failureCount    Int       @default(0)
  totalRequests   Int       @default(0)
  successfulReqs  Int       @default(0)
  
  @@index([isActive, lastFetchAt])
}
```

---

## 🧪 Testing

### **Run Tests**

```bash
# Unit tests
npm run test

# E2E tests (pagination, endpoints)
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### **Test Coverage**

The project includes comprehensive test coverage:

#### **Unit Tests (45 tests):**
- ✅ `AppController` - Health & readiness endpoints (5 tests)
- ✅ `ProductsService` - CRUD operations & pagination logic (13 tests)
- ✅ `ProductsController` - API endpoint handlers (7 tests)
- ✅ `ProvidersService` - External API integration (10 tests)
- ✅ `AggregationService` - Data aggregation & price history (10 tests)

#### **E2E Tests (7 tests):**
- ✅ Product pagination endpoints (offset & cursor-based)
- ✅ API versioning (v1 & v2)
- ✅ Validation of pagination parameters
- ✅ Health and readiness checks
- ✅ Integration tests for complete data flow

**Total: 52 passing tests** covering critical components and user workflows.

---

## 🛠️ Local Development

### **Prerequisites**

- Node.js 20+
- Docker & Docker Compose
- Git

### **Setup Steps**

```bash
# 1. Clone the repository
git clone https://github.com/al0olo/product-price-aggregator
cd product-price-aggregator

# 2. Install dependencies
npm install

# 3. Start database only
docker-compose up -d postgres

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to database
npx prisma db push

# 6. Start development server
npm run start:dev
```

### **Environment Variables**

Create `.env` file:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/priceaggregator?schema=public"

# Application
PORT=3000
NODE_ENV=development

# Provider URLs
PROVIDER_1_URL=http://localhost:3001
PROVIDER_2_URL=http://localhost:3002
PROVIDER_3_URL=http://localhost:3003

# Data fetch configuration
FETCH_INTERVAL_MS=10000
STALE_DATA_THRESHOLD_MS=30000
```

---

## 📦 Project Structure

```
product-price-aggregator/
├── src/
│   ├── aggregation/         # Data aggregation logic
│   │   ├── aggregation.service.ts
│   │   └── scheduler.service.ts
│   ├── products/            # Product endpoints
│   │   ├── products.controller.ts (v1)
│   │   ├── products-v2.controller.ts (v2)
│   │   └── products.service.ts
│   ├── providers/           # Provider management
│   │   ├── providers.controller.ts
│   │   └── providers.service.ts
│   ├── stream/              # SSE real-time updates
│   ├── common/
│   │   ├── database/        # Prisma service
│   │   └── dto/             # Data transfer objects
│   │       ├── api.dto.ts
│   │       └── pagination.dto.ts
│   └── config/              # Environment config
├── prisma/
│   └── schema.prisma        # Database schema
├── providers/               # Mock provider data (different structures)
│   ├── provider-1/db.json   # Nested structure with snake_case
│   ├── provider-2/db.json   # Flat array with camelCase  
│   └── provider-3/db.json   # Wrapper with UPPERCASE keys
├── test/                    # E2E tests
├── docker-compose.yml       # One-command setup
├── Dockerfile               # Production build
└── README.md
```

### **🌟 Different Provider Data Structures**

A key feature showcasing real-world API integration is handling **diverse data structures**:

**Provider 1** (Nested + snake_case):
```json
{"metadata": {...}, "catalog": {"items": [{"product_id": "...", "pricing": {...}}]}}
```

**Provider 2** (Flat array + camelCase):
```json
[{"itemId": "...", "title": "...", "cost": 99.99, "isAvailable": true}]
```

**Provider 3** (Wrapper + UPPERCASE):
```json
{"success": true, "data": [{"ID": "...", "NAME": "...", "PRICE": 99.99}]}
```

**Normalization** (`src/aggregation/provider-adapters.ts`):
- ✅ Adapter pattern with provider-specific normalizers
- ✅ Type-safe interfaces for each provider structure  
- ✅ Extensible: easy to add new providers
- ✅ Error resilience with fallback handling

---

## 🎯 Key Implementation Highlights

### **1. Database-Level Pagination**

```typescript
// Service layer - actual database queries
async findAll(pagination: PaginationQueryDto) {
  const skip = (page - 1) * limit;
  
  // Parallel execution for performance
  const [products, total] = await Promise.all([
    this.prisma.product.findMany({ skip, take: limit }),
    this.prisma.product.count()
  ]);
  
  return { data: products, meta: { /* pagination info */ } };
}
```

### **2. Concurrent Provider Fetching**

```typescript
// Fetch from all providers concurrently
const results = await Promise.allSettled(
  Object.entries(providerUrls).map(async ([id, url]) => {
    const data = await fetchFromProvider(url, id);
    return processProviderProducts(data, id);
  })
);
```

### **3. Type-Safe Configuration**

```typescript
// Zod schema for environment validation
const envSchema = z.object({
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
  PROVIDER_1_URL: z.string().url(),
  // ... more validations
});
```

### **4. Graceful Error Handling**

```typescript
try {
  await processProvider(provider);
} catch (error) {
  logger.error('Provider failed', { provider, error });
  // Continue processing other providers
}
```

---

## 🔄 Data Flow

```
External Providers (3x) 
    ↓ (Concurrent Fetch)
Aggregation Service
    ↓ (Normalize & Validate)
Database (Prisma + PostgreSQL)
    ↓ (Query with Pagination)
REST API (v1, v2)
    ↓
Swagger Documentation
```

---

## ⚡ Performance Optimizations

1. **Database Indexes**: Optimized for common queries
2. **Parallel Queries**: Count and data fetched simultaneously
3. **Cursor Pagination**: O(1) performance for large datasets
4. **Connection Pooling**: Efficient database connections
5. **Batch Processing**: Bulk database operations
6. **Efficient Upserts**: Using Prisma's upsert capabilities

---

## 🚨 Error Handling & Resilience

- **Circuit Breaker**: Prevents cascade failures
- **Retry Logic**: Exponential backoff for transient errors
- **Graceful Degradation**: Continue on partial failures
- **Structured Logging**: Comprehensive error tracking
- **Health Checks**: Kubernetes-ready probes

---

## 📝 Assumptions & Trade-offs

### **Assumptions**
1. Products have unique `externalId` per provider
2. Price changes justify tracking (not just noise)
3. 50 products per provider is sufficient for testing
4. Real-time updates can have 5-second delay (SSE interval)

### **Trade-offs**
1. **Offset vs Cursor Pagination**: Provided both for flexibility
2. **Provider Adapters**: Each provider has different structure, normalized with adapters (see below)
3. **Caching**: Not implemented to keep it simple (could add Redis)
4. **Authentication**: Skipped for MVP (mentioned as optional)
5. **WebSocket**: Used SSE as requested (simpler, HTTP-friendly)

### **What Could Be Added** (Out of Scope for 4h)
- Redis caching layer
- Rate limiting per client
- Advanced filtering (price range, categories)
- GraphQL alternative endpoint
- Webhooks for price alerts
- Admin dashboard
- Comprehensive unit test coverage

---

## 🐳 Docker Configuration

### **Development**
```bash
docker-compose up -d
```

### **Production Build**
```bash
docker build -t price-aggregator .
docker run -p 3000:3000 price-aggregator
```

---

## 📊 Monitoring & Observability

### **Health Checks**
```bash
# Application health
curl http://localhost:3000/v1/health

# Response
{
  "status": "healthy",
  "timestamp": "2025-09-30T...",
  "uptime": 1234.56,
  "database": "connected"
}
```

### **Provider Metrics**
- Total requests
- Successful requests  
- Failure count
- Success rate
- Last fetch time

---

## 🎓 Code Quality & Best Practices

✅ **SOLID Principles**: Single Responsibility, Open/Closed, etc.  
✅ **Clean Architecture**: Layered separation of concerns  
✅ **TypeScript Strict Mode**: No `any`, explicit types  
✅ **Dependency Injection**: NestJS DI container  
✅ **Error Handling**: Try-catch with proper logging  
✅ **Validation**: DTOs with class-validator  
✅ **Documentation**: Comprehensive Swagger annotations  
✅ **Git History**: Meaningful commits with context  

---

## 📧 Submission Details

**Repository**: Private GitHub repository  
**Access Granted To**:
- alhasan.nasiry@digitalzone.app
- suhaib@digitalzone.app
- khairy.mohamed@digitalzone.app

**Deliverables**:
✅ Complete source code  
✅ Prisma schema and migrations  
✅ Docker Compose configuration  
✅ Comprehensive README (this file)  
✅ E2E test files  
✅ Swagger documentation  
✅ Environment configuration

## 📄 License

MIT License - This is a technical assignment solution.

---

## 🙏 Thank You

Thank you for reviewing this assignment. I'm looking forward to discussing the implementation, architecture decisions, and potential improvements in the interview.

**Time Spent**: ~4-5 hours  
**Focus Areas**: Clean architecture, type safety, database optimization, and comprehensive documentation.
