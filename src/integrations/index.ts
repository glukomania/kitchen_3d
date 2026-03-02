// Main exports for platform integrations
export type {
  PlatformType,
  PlatformConfig,
  ShopifyPlatformConfig,
  ShoptetPlatformConfig,
  PlatformAdapter,
  PlatformCart,
  CartItem
} from './types';

export { PlatformFactory } from './factory';

// Platform-specific exports
export { ShopifyClient, type ShopifyConfig } from './shopify/client';
export { ShopifyAdapter } from './shopify/adapter';
export { ShopifyCart } from './shopify/cart';

export { ShoptetClient, type ShoptetConfig } from './shoptet/client';
export { ShoptetAdapter } from './shoptet/adapter';
export { ShoptetCart } from './shoptet/cart';
