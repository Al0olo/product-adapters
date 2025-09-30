export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    url: process.env.DATABASE_URL || '',
  },
  aggregation: {
    fetchIntervalMs: parseInt(process.env.FETCH_INTERVAL_MS || '10000', 10),
    staleDataThresholdMs: parseInt(
      process.env.STALE_DATA_THRESHOLD_MS || '30000',
      10,
    ),
  },
  providers: {
    provider1: {
      url: process.env.PROVIDER_1_URL || 'http://localhost:3001',
    },
    provider2: {
      url: process.env.PROVIDER_2_URL || 'http://localhost:3002',
    },
    provider3: {
      url: process.env.PROVIDER_3_URL || 'http://localhost:3003',
    },
  },
  security: {
    apiKey: process.env.API_KEY,
  },
});
