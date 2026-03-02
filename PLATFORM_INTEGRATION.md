# Platform Integration Guide

This widget supports multiple e-commerce platforms. You can integrate it with **Shopify**, **Shoptet**, or use a static catalog.

## Table of Contents

- [Shopify Integration](#shopify-integration)
- [Shoptet Integration](#shoptet-integration)
- [Static Catalog](#static-catalog)
- [Architecture](#architecture)

---

## Shopify Integration

### Configuration

```html
<script>
  window.kitchenConfiguratorConfig = {
    platform: {
      type: 'shopify',
      domain: 'your-store.myshopify.com',
      storefrontAccessToken: 'your-storefront-access-token'
    }
  };
</script>
<script src="configurator-widget.iife.js"></script>
<kitchen-configurator-widget></kitchen-configurator-widget>
```

### Requirements

1. **Storefront API Access Token**: Create one in Shopify Admin → Settings → Apps and sales channels → Develop apps
2. **Product Tags**: Tag your products with `kitchen-configurator`
3. **Product Handles**: Use naming convention: `kitchen-cabinet-[upper|bottom]-[size]cm`
   - Example: `kitchen-cabinet-upper-40cm`, `kitchen-cabinet-bottom-60cm`

### Legacy Support

The old Shopify configuration format is still supported:

```javascript
window.kitchenConfiguratorConfig = {
  shopify: {
    domain: 'your-store.myshopify.com',
    storefrontAccessToken: 'your-token'
  }
};
```

---

## Shoptet Integration

### Configuration

```html
<script>
  window.kitchenConfiguratorConfig = {
    platform: {
      type: 'shoptet',
      apiUrl: 'https://your-store.shoptet.cz/api',
      apiKey: 'your-api-key'
    }
  };
</script>
<script src="configurator-widget.iife.js"></script>
<kitchen-configurator-widget></kitchen-configurator-widget>
```

### Requirements

1. **API Key**: Generate in Shoptet Admin → Settings → API
2. **Product Tags**: Tag your products with `kitchen-configurator`
3. **Product Codes**: Use naming convention: `kitchen-cabinet-[upper|bottom]-[size]cm`
   - Example: `kitchen-cabinet-upper-40cm`, `kitchen-cabinet-bottom-60cm`

### API Endpoints Used

- `GET /products?tag=kitchen-configurator` - Fetch products
- `POST /cart/add-cart-items` - Add items to cart

---

## Static Catalog

If you don't want to integrate with an e-commerce platform, you can provide a static catalog:

```html
<script>
  window.kitchenConfiguratorConfig = {
    catalog: {
      products: [
        {
          id: 'cabinet-upper-40',
          title: 'Upper Cabinet 40cm',
          subtitle: 'Kitchen Cabinet',
          basePrice: { amount: 2500, currency: 'CZK' },
          imageUrl: '/images/cabinet-upper-40.png',
          optionGroups: [
            {
              id: 'color',
              kind: 'swatches',
              label: 'Barva',
              options: [
                { id: 'white', label: 'Bílá', color: '#FFFFFF' },
                { id: 'gray', label: 'Šedá', color: '#F3F4F6' }
              ],
              defaultOptionId: 'white'
            }
          ]
        }
        // ... more products
      ]
    }
  };
</script>
```

---

## Architecture

### Platform Abstraction

The widget uses a platform-agnostic architecture:

```
integrations/
├── types.ts              # Common interfaces
├── factory.ts            # Platform factory
├── shopify/
│   ├── client.ts         # Shopify API client
│   ├── adapter.ts        # Shopify → Catalog adapter
│   └── cart.ts           # Shopify cart operations
└── shoptet/
    ├── client.ts         # Shoptet API client
    ├── adapter.ts        # Shoptet → Catalog adapter
    └── cart.ts           # Shoptet cart operations
```

### Key Interfaces

#### `PlatformAdapter`

Responsible for fetching and transforming product data:

```typescript
interface PlatformAdapter {
  fetchCatalog(): Promise<Catalog>;
}
```

#### `PlatformCart`

Handles cart operations:

```typescript
interface PlatformCart {
  addItems(items: CartItem[]): Promise<string>;
}
```

### Adding a New Platform

1. Create a new folder in `src/integrations/[platform-name]/`
2. Implement `client.ts`, `adapter.ts`, and `cart.ts`
3. Add the platform type to `PlatformConfig` in `types.ts`
4. Update `PlatformFactory` to handle the new platform
5. Update this documentation

### Product Metadata

Products include platform-specific metadata:

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

This allows the widget to work with multiple platforms while maintaining a unified internal data model.
