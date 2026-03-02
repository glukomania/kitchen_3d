# Changelog: Multi-Platform Integration

## Overview

Added support for multiple e-commerce platforms (Shopify, Shoptet) with a unified, extensible architecture. The widget can now be easily integrated into different e-commerce systems without code duplication.

## What Changed

### New Features

✅ **Multi-platform support**
- Shopify integration (refactored from existing code)
- Shoptet integration (new)
- Static catalog support (existing, unchanged)

✅ **Unified configuration API**
- Single `platform` config object
- Type-safe platform selection
- Backward compatibility with legacy Shopify config

✅ **Extensible architecture**
- Abstract interfaces for platform adapters
- Factory pattern for creating platform instances
- Easy to add new platforms in the future

### Architecture Changes

#### New Files

```
src/integrations/
├── types.ts              # Common interfaces and types
├── factory.ts            # Platform factory
├── index.ts              # Public exports
├── shopify/              # Shopify integration (refactored)
│   ├── client.ts
│   ├── adapter.ts
│   └── cart.ts
└── shoptet/              # Shoptet integration (new)
    ├── client.ts
    ├── adapter.ts
    └── cart.ts
```

#### Modified Files

- `src/features/configurator/model/types.ts`
  - Added `_shoptet` metadata to `Product` type
  
- `src/features/configurator/state/store.ts`
  - Replaced `shopifyClient` and `shopifyCart` with generic `platformAdapter` and `platformCart`
  - Added `platformType` field
  - Added `initPlatform()` action
  - Kept `initShopify()` for backward compatibility
  - Updated `addToCart()` to work with any platform

- `src/widget/WidgetRoot.tsx`
  - Added support for `config.platform`
  - Kept backward compatibility with `config.shopify`

- `src/features/configurator/ui/ButtonsPanel.tsx`
  - Fixed linter error (async onClick handler)

#### Documentation

New documentation files:
- `PLATFORM_INTEGRATION.md` - Complete integration guide
- `MIGRATION_GUIDE.md` - Migration instructions
- `USAGE_EXAMPLES.md` - Quick reference examples
- `DEPLOYMENT_CHECKLIST.md` - Deployment checklist

Updated files:
- `README.md` - Added platform integration section
- `ARCHITECTURE.md` - Added integrations layer description

Example files:
- `embed-example-shopify.html` - Shopify example
- `embed-example-shoptet.html` - Shoptet example

## Breaking Changes

**None!** The old configuration format is still supported:

```javascript
// Old format (still works)
window.kitchenConfiguratorConfig = {
  shopify: { ... }
};

// New format (recommended)
window.kitchenConfiguratorConfig = {
  platform: {
    type: 'shopify',
    ...
  }
};
```

## Migration Path

### For Existing Shopify Users

**Option 1: No changes needed**
- Your existing configuration will continue to work

**Option 2: Update to new format (recommended)**
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

### For New Shoptet Users

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

## Technical Details

### Platform Abstraction

Two main interfaces:

1. **PlatformAdapter** - Fetches and transforms product data
   ```typescript
   interface PlatformAdapter {
     fetchCatalog(): Promise<Catalog>;
   }
   ```

2. **PlatformCart** - Handles cart operations
   ```typescript
   interface PlatformCart {
     addItems(items: CartItem[]): Promise<string>;
   }
   ```

### Type Safety

All platform configurations are type-safe:
```typescript
type PlatformConfig = 
  | { type: 'shopify'; domain: string; storefrontAccessToken: string }
  | { type: 'shoptet'; apiUrl: string; apiKey: string };
```

### Product Metadata

Products now support platform-specific metadata:
```typescript
type Product = {
  // ... common fields
  _shopify?: { id: string; variantId: string; ... };
  _shoptet?: { guid: string; variantId: string; ... };
};
```

## Testing

All changes have been:
- ✅ Linted (no errors)
- ✅ Type-checked (TypeScript)
- ✅ Built successfully
- ⏳ Pending integration testing with live stores

## Future Enhancements

Potential additions:
- WooCommerce integration
- Magento integration
- Custom webhook support
- Analytics integration
- A/B testing support

## Credits

Implementation follows the existing architecture patterns:
- Strict layer separation
- No UI in state/data layers
- Factory pattern for platform selection
- Backward compatibility maintained
