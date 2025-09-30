# Product Price Aggregator API

A production-ready Product Price Aggregation service built with NestJS, Prisma, and PostgreSQL.

## Features

- **Real-time Price Aggregation**: Fetches product data from multiple providers
- **Price History Tracking**: Maintains complete price change history
- **Server-Sent Events**: Real-time updates via SSE
- **Circuit Breaker Pattern**: Fault tolerance for external APIs
- **Comprehensive Monitoring**: Health checks and metrics
- **Type Safety**: Full TypeScript support with strict typing

## Quick Start

### One-Command Setup

```bash
# Clone and start everything
git clone <repository-url>
cd product-price-aggregator
docker-compose up -d
```

This single command will:
- Start PostgreSQL database
- Install dependencies
- Generate Prisma client
- Push database schema
- Start 3 mock provider APIs
- Start the main application

### Access Points

- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api
- **Provider 1**: http://localhost:3001
- **Provider 2**: http://localhost:3002
- **Provider 3**: http://localhost:3003

## API Endpoints

### Products
- `GET /products` - List all products
- `GET /products/:id` - Get product by ID
- `GET /products/search?q=query` - Search products

### Providers
- `GET /providers` - List all providers
- `GET /providers/:id` - Get provider by ID

### Stream
- `GET /stream/products` - Server-Sent Events stream for real-time updates

### Health
- `GET /health` - Application health check
- `GET /ready` - Readiness probe

## Development

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Local Development

```bash
# Install dependencies
npm install

# Start database
docker-compose up -d postgres

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run start:dev
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/priceaggregator?schema=public"
PORT=3000
PROVIDER_1_URL=http://localhost:3001
PROVIDER_2_URL=http://localhost:3002
PROVIDER_3_URL=http://localhost:3003
```

## Architecture

### Services
- **Products Service**: Manages product data and search
- **Providers Service**: Handles external API communication
- **Aggregation Service**: Orchestrates data collection
- **Stream Service**: Provides real-time updates

### Database Schema
- **Products**: Core product information
- **PriceHistory**: Complete price change tracking
- **Providers**: Provider configuration and metrics

### Key Features
- **Circuit Breaker**: Prevents cascade failures
- **Retry Logic**: Exponential backoff for transient failures
- **Batch Processing**: Efficient data handling
- **Real-time Updates**: SSE for live data streaming

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

## Monitoring

The application includes comprehensive monitoring:
- Health checks at `/health` and `/ready`
- Structured logging with correlation IDs
- Performance metrics
- Error tracking and alerting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.