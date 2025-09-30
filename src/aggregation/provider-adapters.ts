export interface NormalizedProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  availability: boolean;
  lastUpdated: string;
}

// Provider 1 structure: Nested with snake_case
interface Provider1Response {
  metadata?: {
    provider: string;
    version: string;
    timestamp: string;
  };
  catalog?: {
    items: Array<{
      product_id: string;
      product_name: string;
      product_desc?: string;
      pricing: {
        amount: number;
        currency_code: string;
      };
      stock: {
        in_stock: boolean;
        quantity?: number;
      };
      last_modified: string;
    }>;
  };
}

// Provider 2 structure: Flat array with camelCase
interface Provider2Product {
  itemId: string;
  title: string;
  details?: string;
  cost: number;
  currencyType: string;
  isAvailable: boolean;
  updatedAt: string;
}

// Provider 3 structure: Wrapper with UPPERCASE
interface Provider3Response {
  success: boolean;
  count: number;
  data: Array<{
    ID: string;
    NAME: string;
    DESCRIPTION?: string;
    PRICE: number;
    CURRENCY: string;
    AVAILABLE: boolean;
    LAST_UPDATE: string;
  }>;
}

/**
 * Adapter for Provider 1 (TechStore API)
 * Structure: { metadata: {...}, catalog: { items: [...] } }
 * Fields: snake_case
 */
export function normalizeProvider1Data(rawData: unknown): NormalizedProduct[] {
  const data = rawData as Provider1Response;

  if (!data.catalog?.items || !Array.isArray(data.catalog.items)) {
    console.warn(
      'Provider 1: Invalid data structure, no catalog.items array found',
    );
    return [];
  }

  return data.catalog.items.map((item) => ({
    id: item.product_id,
    name: item.product_name,
    description: item.product_desc || null,
    price: item.pricing.amount,
    currency: item.pricing.currency_code,
    availability: item.stock.in_stock,
    lastUpdated: item.last_modified,
  }));
}

/**
 * Adapter for Provider 2
 * Structure: Array of products directly
 * Fields: camelCase
 */
export function normalizeProvider2Data(rawData: unknown): NormalizedProduct[] {
  const data = rawData as
    | Provider2Product[]
    | { products?: Provider2Product[] };

  // Handle if wrapped in products key or direct array
  const products = Array.isArray(data)
    ? data
    : (data as { products?: Provider2Product[] }).products || [];

  if (!Array.isArray(products)) {
    console.warn('Provider 2: Invalid data structure, expected array');
    return [];
  }

  return products.map((item) => ({
    id: item.itemId,
    name: item.title,
    description: item.details || null,
    price: item.cost,
    currency: item.currencyType,
    availability: item.isAvailable,
    lastUpdated: item.updatedAt,
  }));
}

/**
 * Adapter for Provider 3
 * Structure: { success: boolean, count: number, data: [...] }
 * Fields: UPPERCASE
 */
export function normalizeProvider3Data(rawData: unknown): NormalizedProduct[] {
  const data = rawData as Provider3Response;

  if (!data.success || !data.data || !Array.isArray(data.data)) {
    console.warn('Provider 3: Invalid data structure or unsuccessful response');
    return [];
  }

  return data.data.map((item) => ({
    id: item.ID,
    name: item.NAME,
    description: item.DESCRIPTION || null,
    price: item.PRICE,
    currency: item.CURRENCY,
    availability: item.AVAILABLE,
    lastUpdated: item.LAST_UPDATE,
  }));
}

/**
 * Main adapter factory that routes to the correct normalizer
 */
export function normalizeProviderData(
  providerId: string,
  rawData: unknown,
): NormalizedProduct[] {
  try {
    switch (providerId) {
      case 'provider1':
        return normalizeProvider1Data(rawData);
      case 'provider2':
        return normalizeProvider2Data(rawData);
      case 'provider3':
        return normalizeProvider3Data(rawData);
      default:
        console.warn(
          `Unknown provider: ${providerId}, attempting generic normalization`,
        );
        return attemptGenericNormalization(rawData);
    }
  } catch (error) {
    console.error(`Error normalizing data for ${providerId}:`, error);
    return [];
  }
}

/**
 * Fallback generic normalizer for unknown providers
 * Attempts to extract products from common patterns
 */
function attemptGenericNormalization(rawData: unknown): NormalizedProduct[] {
  // Try common patterns
  const data = rawData as Record<string, unknown>;

  // Pattern 1: { products: [...] }
  if (data.products && Array.isArray(data.products)) {
    return normalizeProvider2Data(data.products);
  }

  // Pattern 2: Direct array
  if (Array.isArray(rawData)) {
    return normalizeProvider2Data(rawData);
  }

  // Pattern 3: { data: [...] }
  if (data.data && Array.isArray(data.data)) {
    return normalizeProvider3Data(rawData);
  }

  console.warn('Could not normalize data with any known pattern');
  return [];
}
