import type { ShoptetPlatformConfig } from '@/integrations/types';

export type ShoptetConfig = ShoptetPlatformConfig;

/**
 * Shoptet API client
 * Documentation: https://developers.shoptet.cz/api/
 */
export class ShoptetClient {
  private apiUrl: string;
  private headers: HeadersInit;

  constructor(config: ShoptetConfig) {
    this.apiUrl = config.apiUrl;
    this.headers = {
      'Content-Type': 'application/json',
      'Shoptet-Access-Token': config.apiKey
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method: 'GET',
      headers: this.headers
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Shoptet API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: text,
        endpoint: `${this.apiUrl}${endpoint}`
      });
      throw new Error(`Shoptet API error: ${response.status} ${response.statusText}`);
    }

    const result = (await response.json()) as { data: T };
    return result.data;
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Shoptet API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: text,
        endpoint: `${this.apiUrl}${endpoint}`
      });
      throw new Error(`Shoptet API error: ${response.status} ${response.statusText}`);
    }

    const result = (await response.json()) as { data: T };
    return result.data;
  }
}
