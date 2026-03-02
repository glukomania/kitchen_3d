import type { Catalog } from '@/features/configurator/model/types';

/**
 * Platform type identifier
 */
export type PlatformType = 'shopify' | 'shoptet';

/**
 * Generic platform configuration
 */
export type PlatformConfig = {
  type: PlatformType;
} & (ShopifyPlatformConfig | ShoptetPlatformConfig);

export type ShopifyPlatformConfig = {
  type: 'shopify';
  domain: string;
  storefrontAccessToken: string;
};

export type ShoptetPlatformConfig = {
  type: 'shoptet';
  apiUrl: string;
  apiKey: string;
};

/**
 * Abstract interface for e-commerce platform integration
 */
export interface PlatformAdapter {
  /**
   * Fetch product catalog from the platform
   */
  fetchCatalog(): Promise<Catalog>;
}

/**
 * Abstract interface for cart operations
 */
export interface PlatformCart {
  /**
   * Add items to cart and return checkout URL
   */
  addItems(items: CartItem[]): Promise<string>;
}

export type CartItem = {
  variantId: string;
  quantity: number;
};
