# Migration Guide: Multi-Platform Support

## Overview

The widget now supports multiple e-commerce platforms (Shopify, Shoptet) through a unified configuration interface. This guide helps you migrate existing Shopify integrations to the new format.

## What Changed?

### Before (Shopify-only)

```javascript
window.kitchenConfiguratorConfig = {
  shopify: {
    domain: 'your-store.myshopify.com',
    storefrontAccessToken: 'your-token'
  }
};
```

### After (Multi-platform)

```javascript
window.kitchenConfiguratorConfig = {
  platform: {
    type: 'shopify',  // or 'shoptet'
    domain: 'your-store.myshopify.com',
    storefrontAccessToken: 'your-token'
  }
};
```

## Migration Steps

### For Existing Shopify Integrations

**Good news:** The old format still works! Legacy support is built-in.

However, we recommend updating to the new format:

1. **Find your configuration** in your HTML/template files
2. **Wrap the `shopify` object** in a `platform` object
3. **Add `type: 'shopify'`** to the configuration

**Example:**

```diff
window.kitchenConfiguratorConfig = {
-  shopify: {
+  platform: {
+    type: 'shopify',
     domain: 'your-store.myshopify.com',
     storefrontAccessToken: 'your-token'
   }
};
```

### For New Shoptet Integrations

Use the new platform configuration:

```javascript
window.kitchenConfiguratorConfig = {
  platform: {
    type: 'shoptet',
    apiUrl: 'https://your-store.shoptet.cz/api',
    apiKey: 'your-api-key'
  }
};
```

## Code Changes (for developers)

### Store Changes

- `shopifyClient` → `platformAdapter`
- `shopifyCart` → `platformCart`
- New field: `platformType` ('shopify' | 'shoptet' | null)

### New Actions

- `initPlatform(config: PlatformConfig)` - replaces `initShopify`
- `initShopify(config: ShopifyConfig)` - still available for legacy support

### Product Metadata

Products now include platform-specific metadata:

```typescript
type Product = {
  // ... common fields
  _shopify?: {
    id: string;
    variantId: string;
    type: string;
    size: string;
  };
  _shoptet?: {
    guid: string;
    variantId: string;
    type: string;
    size: string;
  };
};
```

## Testing

After migration, test the following:

1. ✅ Widget loads without errors
2. ✅ Products are fetched from the platform
3. ✅ Cabinets can be added to the configurator
4. ✅ "Add to cart" button works
5. ✅ Redirect to checkout works

## Rollback

If you encounter issues, you can rollback to the old format:

```javascript
window.kitchenConfiguratorConfig = {
  shopify: {
    domain: 'your-store.myshopify.com',
    storefrontAccessToken: 'your-token'
  }
};
```

The legacy format will continue to work.

## Support

For detailed integration instructions, see:
- `PLATFORM_INTEGRATION.md` - Complete integration guide
- `embed-example-shopify.html` - Shopify example
- `embed-example-shoptet.html` - Shoptet example

## Benefits of the New Format

1. **Single codebase** for multiple platforms
2. **Easy to add new platforms** (WooCommerce, Magento, etc.)
3. **Consistent API** across platforms
4. **Better maintainability** - no code duplication
5. **Type-safe** platform configuration
