import type { ShopifyPlatformConfig } from '@/integrations/types';

export type ShopifyConfig = ShopifyPlatformConfig;

type GraphQLResponse<T> = {
  data: T;
  errors?: Array<{ message: string }>;
};

export class ShopifyClient {
  private endpoint: string;
  private headers: HeadersInit;

  constructor(config: ShopifyConfig) {
    this.endpoint = `https://${config.domain}/api/2024-01/graphql.json`;
    this.headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken
    };
  }

  async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Shopify API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: text,
        endpoint: this.endpoint,
        headers: this.headers
      });
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const result = (await response.json()) as GraphQLResponse<T>;
    if (result.errors && result.errors.length > 0) {
      console.error('GraphQL errors:', result.errors);
      throw new Error(result.errors[0].message);
    }
    return result.data;
  }
}
