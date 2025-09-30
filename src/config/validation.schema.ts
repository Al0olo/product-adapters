import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  FETCH_INTERVAL_MS: Joi.number().default(10000),
  STALE_DATA_THRESHOLD_MS: Joi.number().default(30000),
  PROVIDER_1_URL: Joi.string().uri().default('http://localhost:3001'),
  PROVIDER_2_URL: Joi.string().uri().default('http://localhost:3002'),
  PROVIDER_3_URL: Joi.string().uri().default('http://localhost:3003'),
  API_KEY: Joi.string().optional(),
});
