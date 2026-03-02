import type { PlatformConfig, PlatformAdapter, PlatformCart } from './types';
import { ShopifyClient } from './shopify/client';
import { ShopifyAdapter } from './shopify/adapter';
import { ShopifyCart } from './shopify/cart';
import { ShoptetClient } from './shoptet/client';
import { ShoptetAdapter } from './shoptet/adapter';
import { ShoptetCart } from './shoptet/cart';

/**
 * Factory for creating platform-specific adapter and cart instances
 */
export class PlatformFactory {
  static createAdapter(config: PlatformConfig): PlatformAdapter {
    switch (config.type) {
      case 'shopify': {
        const client = new ShopifyClient(config);
        return new ShopifyAdapter(client);
      }
      case 'shoptet': {
        const client = new ShoptetClient(config);
        return new ShoptetAdapter(client);
      }
      default: {
        const unknownConfig = config as { type: string };
        throw new Error(`Unknown platform type: ${unknownConfig.type}`);
      }
    }
  }

  static createCart(config: PlatformConfig): PlatformCart {
    switch (config.type) {
      case 'shopify': {
        const client = new ShopifyClient(config);
        return new ShopifyCart(client);
      }
      case 'shoptet': {
        const client = new ShoptetClient(config);
        return new ShoptetCart(client);
      }
      default: {
        const unknownConfig = config as { type: string };
        throw new Error(`Unknown platform type: ${unknownConfig.type}`);
      }
    }
  }
}
