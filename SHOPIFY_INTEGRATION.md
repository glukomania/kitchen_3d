# Shopify Deep Integration Guide

## Overview

Integrate the configurator with Shopify to:
1. Fetch product data (prices, descriptions) from Shopify
2. Add configured items to Shopify cart
3. Sync inventory and availability

---

## Architecture

```
┌─────────────────────┐
│  Shopify Store      │
│  (Products, Cart)   │
└──────────┬──────────┘
           │ Storefront API (GraphQL)
           │
┌──────────▼──────────┐
│  Web Component      │
│  (Configurator)     │
└─────────────────────┘
```

---

## 1. Setup Shopify Storefront API

### Create Storefront Access Token

1. Go to Shopify Admin → Settings → Apps and sales channels
2. Click "Develop apps"
3. Create new app: "Kitchen Configurator"
4. Configure Storefront API access with scopes:
   - `unauthenticated_read_products`
   - `unauthenticated_write_checkouts`
   - `unauthenticated_read_product_listings`

5. Install app and copy **Storefront Access Token**

### Store Configuration

Add to widget configuration:

```typescript
// src/widget/types.ts
export type ShopifyConfig = {
  domain: string; // 'your-store.myshopify.com'
  storefrontAccessToken: string;
  apiVersion: string; // '2024-01'
};

export type WidgetConfig = {
  shopify?: ShopifyConfig;
  catalog?: Catalog; // Fallback if Shopify unavailable
};
```

---

## 2. Shopify API Client

### Create API Client

```typescript
// src/integrations/shopify/client.ts
import { ShopifyConfig } from '@/widget/types';

export class ShopifyClient {
  private endpoint: string;
  private headers: HeadersInit;

  constructor(config: ShopifyConfig) {
    this.endpoint = `https://${config.domain}/api/${config.apiVersion}/graphql.json`;
    this.headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken
    };
  }

  async query<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const { data, errors } = await response.json();
    
    if (errors) {
      throw new Error(`GraphQL error: ${errors[0].message}`);
    }

    return data;
  }
}
```

---

## 3. Fetch Products from Shopify

### GraphQL Queries

```typescript
// src/integrations/shopify/queries.ts

export const GET_PRODUCTS = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                sku
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          metafields(identifiers: [
            {namespace: "configurator", key: "cabinet_type"},
            {namespace: "configurator", key: "cabinet_size"},
            {namespace: "configurator", key: "color_options"}
          ]) {
            key
            value
            type
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_BY_HANDLE = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      description
      variants(first: 50) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            sku
            availableForSale
          }
        }
      }
    }
  }
`;
```

### Product Adapter

```typescript
// src/integrations/shopify/adapter.ts
import { Catalog, Product, OptionGroup } from '@/features/configurator/model/types';
import { ShopifyClient } from './client';
import { GET_PRODUCTS } from './queries';

export class ShopifyProductAdapter {
  constructor(private client: ShopifyClient) {}

  async fetchCatalog(): Promise<Catalog> {
    const data = await this.client.query<any>(GET_PRODUCTS, {
      first: 50,
      query: 'tag:kitchen-configurator' // Filter products by tag
    });

    const products = data.products.edges.map((edge: any) => 
      this.mapShopifyProduct(edge.node)
    );

    return { products };
  }

  private mapShopifyProduct(shopifyProduct: any): Product {
    // Extract metafields for configurator options
    const metafields = this.parseMetafields(shopifyProduct.metafields);
    
    // Map Shopify product to configurator product
    return {
      id: shopifyProduct.handle,
      title: shopifyProduct.title,
      subtitle: shopifyProduct.description?.substring(0, 100) || '',
      basePrice: {
        amount: parseFloat(shopifyProduct.priceRange.minVariantPrice.amount) * 100, // Convert to cents
        currency: shopifyProduct.priceRange.minVariantPrice.currencyCode
      },
      optionGroups: this.buildOptionGroups(shopifyProduct, metafields),
      // Store original Shopify data for cart integration
      _shopify: {
        id: shopifyProduct.id,
        variants: shopifyProduct.variants.edges.map((e: any) => e.node)
      }
    };
  }

  private parseMetafields(metafields: any[]): Record<string, any> {
    const result: Record<string, any> = {};
    metafields.forEach(mf => {
      if (mf) {
        result[mf.key] = JSON.parse(mf.value);
      }
    });
    return result;
  }

  private buildOptionGroups(product: any, metafields: any): OptionGroup[] {
    const groups: OptionGroup[] = [];

    // Color options from metafield
    if (metafields.color_options) {
      groups.push({
        id: 'color',
        kind: 'swatches',
        label: 'Color',
        options: metafields.color_options.map((c: any) => ({
          id: c.id,
          label: c.label,
          color: c.hex
        })),
        defaultOptionId: metafields.color_options[0]?.id
      });
    }

    // Size options from variants
    const sizes = new Set<string>();
    product.variants.edges.forEach((edge: any) => {
      const sizeOption = edge.node.selectedOptions.find(
        (opt: any) => opt.name === 'Size'
      );
      if (sizeOption) sizes.add(sizeOption.value);
    });

    if (sizes.size > 0) {
      groups.push({
        id: 'size',
        kind: 'select',
        label: 'Size',
        options: Array.from(sizes).map(size => ({
          id: size.toLowerCase(),
          label: size
        })),
        defaultOptionId: Array.from(sizes)[0].toLowerCase()
      });
    }

    return groups;
  }
}
```

---

## 4. Add to Shopify Cart

### Cart Mutations

```typescript
// src/integrations/shopify/mutations.ts

export const CREATE_CART = `
  mutation CreateCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const ADD_TO_CART = `
  mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const GET_CART = `
  query GetCart($id: ID!) {
    cart(id: $id) {
      id
      checkoutUrl
      totalQuantity
      lines(first: 50) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price {
                  amount
                }
              }
            }
          }
        }
      }
    }
  }
`;
```

### Cart Manager

```typescript
// src/integrations/shopify/cart.ts
import { ShopifyClient } from './client';
import { CREATE_CART, ADD_TO_CART, GET_CART } from './mutations';

export type CartLineItem = {
  merchandiseId: string; // Shopify variant ID
  quantity: number;
  attributes?: { key: string; value: string }[]; // Custom attributes
};

export class ShopifyCartManager {
  private cartId: string | null = null;
  
  constructor(private client: ShopifyClient) {
    // Try to restore cart from localStorage
    this.cartId = localStorage.getItem('shopify_cart_id');
  }

  async addItems(items: CartLineItem[]): Promise<string> {
    if (!this.cartId) {
      // Create new cart
      const data = await this.client.query<any>(CREATE_CART, {
        input: {
          lines: items.map(item => ({
            merchandiseId: item.merchandiseId,
            quantity: item.quantity,
            attributes: item.attributes
          }))
        }
      });

      if (data.cartCreate.userErrors.length > 0) {
        throw new Error(data.cartCreate.userErrors[0].message);
      }

      this.cartId = data.cartCreate.cart.id;
      localStorage.setItem('shopify_cart_id', this.cartId);
      
      return data.cartCreate.cart.checkoutUrl;
    } else {
      // Add to existing cart
      const data = await this.client.query<any>(ADD_TO_CART, {
        cartId: this.cartId,
        lines: items.map(item => ({
          merchandiseId: item.merchandiseId,
          quantity: item.quantity,
          attributes: item.attributes
        }))
      });

      if (data.cartLinesAdd.userErrors.length > 0) {
        throw new Error(data.cartLinesAdd.userErrors[0].message);
      }

      return data.cartLinesAdd.cart.checkoutUrl;
    }
  }

  async getCart() {
    if (!this.cartId) return null;

    const data = await this.client.query<any>(GET_CART, {
      id: this.cartId
    });

    return data.cart;
  }

  clearCart() {
    this.cartId = null;
    localStorage.removeItem('shopify_cart_id');
  }
}
```

---

## 5. Integration with Configurator State

### Update Store

```typescript
// src/features/configurator/state/store.ts
import { ShopifyClient } from '@/integrations/shopify/client';
import { ShopifyCartManager } from '@/integrations/shopify/cart';
import { ShopifyProductAdapter } from '@/integrations/shopify/adapter';

type ConfiguratorActions = {
  // ... existing actions
  initializeShopify: (config: ShopifyConfig) => Promise<void>;
  addToShopifyCart: () => Promise<string>; // Returns checkout URL
};

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  // ... existing state
  shopifyClient: null as ShopifyClient | null,
  shopifyCart: null as ShopifyCartManager | null,

  initializeShopify: async (config: ShopifyConfig) => {
    const client = new ShopifyClient(config);
    const cart = new ShopifyCartManager(client);
    const adapter = new ShopifyProductAdapter(client);

    // Fetch catalog from Shopify
    const catalog = await adapter.fetchCatalog();

    set({
      shopifyClient: client,
      shopifyCart: cart,
      catalog
    });
  },

  addToShopifyCart: async () => {
    const state = get();
    const { shopifyCart, placedCabinets, selectedOptions } = state;

    if (!shopifyCart) {
      throw new Error('Shopify not initialized');
    }

    // Map configured cabinets to Shopify variants
    const items: CartLineItem[] = placedCabinets.map(cabinet => {
      const variant = findMatchingVariant(cabinet, selectedOptions);
      
      return {
        merchandiseId: variant.shopifyId,
        quantity: 1,
        attributes: [
          { key: 'Position', value: `${cabinet.x},${cabinet.y}` },
          { key: 'Rotation', value: String(cabinet.rotation) },
          { key: 'Type', value: cabinet.type },
          { key: 'Size', value: cabinet.size }
        ]
      };
    });

    const checkoutUrl = await shopifyCart.addItems(items);
    return checkoutUrl;
  }
}));

function findMatchingVariant(cabinet: PlacedCabinet, options: SelectedOptions) {
  // Find Shopify variant based on cabinet configuration
  // This depends on how you structure your Shopify products
  // Example: SKU format "CABINET-TOP-40-WHITE"
  const sku = `CABINET-${cabinet.type.toUpperCase()}-${cabinet.size}-${options.color?.toUpperCase()}`;
  
  // Return variant ID (you'll need to store this mapping in product data)
  return { shopifyId: 'gid://shopify/ProductVariant/123456789' };
}
```

### Update Widget Root

```typescript
// src/widget/WidgetRoot.tsx
import { useEffect, useMemo } from "react";
import { WidgetConfig } from "@/widget/types";
import { Configurator } from "@/features/configurator/ui/Configurator";
import { useAppDispatch } from "@/app/hooks";

type Props = {
  config?: WidgetConfig;
};

export function WidgetRoot(props: Props) {
  const dispatch = useAppDispatch();
  const config = useMemo(() => props.config, [props.config]);

  useEffect(() => {
    if (!config) return;

    queueMicrotask(async () => {
      if (config.shopify) {
        // Initialize Shopify integration
        await dispatch.initializeShopify(config.shopify);
      } else if (config.catalog) {
        // Use static catalog as fallback
        dispatch.setCatalog(config.catalog);
      }
    });
  }, [config, dispatch]);

  return <Configurator />;
}
```

---

## 6. Update UI Components

### Add "Add to Cart" Button

```typescript
// src/features/configurator/ui/ButtonsPanel.tsx
import { useState } from "react";
import { useAppDispatch } from "@/app/hooks";
import { Button } from "@/features/configurator/ui/Button";

export function ButtonsPanel() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = async () => {
    setLoading(true);
    setError(null);

    try {
      const checkoutUrl = await dispatch.addToShopifyCart();
      
      // Redirect to Shopify checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleAddToCart} disabled={loading}>
        {loading ? 'Adding to cart...' : 'Add to cart'}
      </Button>
      
      {error && (
        <div className="text-sm text-red-600 mt-2">{error}</div>
      )}
      
      <Button variant="secondary">
        Send request
      </Button>
    </>
  );
}
```

---

## 7. Shopify Product Setup

### Product Structure

Create products in Shopify with this structure:

**Product:** Kitchen Cabinet - Upper 40cm
- **Variants:**
  - White / 40cm (SKU: CABINET-TOP-40-WHITE)
  - Gray / 40cm (SKU: CABINET-TOP-40-GRAY)
  - Beige / 40cm (SKU: CABINET-TOP-40-BEIGE)

**Product:** Kitchen Cabinet - Upper 60cm
- **Variants:**
  - White / 60cm (SKU: CABINET-TOP-60-WHITE)
  - Gray / 60cm (SKU: CABINET-TOP-60-GRAY)
  - Beige / 60cm (SKU: CABINET-TOP-60-BEIGE)

### Add Metafields

In Shopify Admin → Settings → Custom data → Products:

1. **configurator.cabinet_type**
   - Type: Single line text
   - Value: "top" or "bottom"

2. **configurator.cabinet_size**
   - Type: Single line text
   - Value: "40" or "60"

3. **configurator.color_options**
   - Type: JSON
   - Value:
   ```json
   [
     {"id": "white", "label": "White", "hex": "#FFFFFF"},
     {"id": "gray", "label": "Gray", "hex": "#F3F4F6"},
     {"id": "beige", "label": "Beige", "hex": "#F5F5DC"}
   ]
   ```

4. **configurator.images**
   - Type: List of files
   - Upload cabinet images (40_bottom.png, etc.)

### Tag Products

Add tag `kitchen-configurator` to all products that should appear in configurator.

---

## 8. Embedding with Shopify Config

### Updated Embed Code

```html
<link rel="stylesheet" href="https://your-domain.github.io/project/widget.css">
<script src="https://your-domain.github.io/project/widget.iife.js"></script>

<your-widget id="configurator"></your-widget>

<script>
  const config = {
    shopify: {
      domain: 'your-store.myshopify.com',
      storefrontAccessToken: 'your-storefront-access-token',
      apiVersion: '2024-01'
    }
  };
  
  customElements.whenDefined('your-widget').then(() => {
    const element = document.getElementById('configurator');
    element.setAttribute('data-config', JSON.stringify(config));
  });
</script>
```

### Security Note

**NEVER expose Admin API token in frontend!** Only use Storefront API token, which is safe for public use.

---

## 9. Testing

### Test Checklist

- [ ] Products fetch correctly from Shopify
- [ ] Prices display in correct currency
- [ ] Variants map to configurator options
- [ ] Images load from Shopify CDN
- [ ] Add to cart creates new cart
- [ ] Add to cart adds to existing cart
- [ ] Cart persists across page reloads
- [ ] Checkout URL redirects correctly
- [ ] Custom attributes appear in Shopify order
- [ ] Out of stock products are disabled
- [ ] Error handling works (network errors, API errors)

### Mock Data for Development

```typescript
// src/integrations/shopify/__mocks__/client.ts
export class MockShopifyClient {
  async query<T>(query: string): Promise<T> {
    // Return mock data for development
    return mockProductData as T;
  }
}
```

---

## 10. Advanced Features

### Real-time Inventory

```typescript
// Poll for inventory updates
useEffect(() => {
  const interval = setInterval(async () => {
    const products = await adapter.fetchCatalog();
    dispatch.updateCatalog(products);
  }, 60000); // Every minute

  return () => clearInterval(interval);
}, []);
```

### Price Calculations

```typescript
// Calculate total with Shopify prices
const calculateTotal = () => {
  return placedCabinets.reduce((total, cabinet) => {
    const variant = findVariant(cabinet);
    return total + parseFloat(variant.price.amount) * 100;
  }, 0);
};
```

### Custom Line Item Properties

```typescript
// Add 3D model configuration to cart
attributes: [
  { key: '_3d_config', value: JSON.stringify({
    cabinets: placedCabinets,
    color: selectedOptions.color,
    timestamp: Date.now()
  })}
]
```

---

## 11. Deployment Checklist

- [ ] Storefront Access Token created
- [ ] Products tagged correctly
- [ ] Metafields configured
- [ ] Variants created for all options
- [ ] Images uploaded to Shopify
- [ ] Widget config updated with tokens
- [ ] CORS enabled (Shopify handles this automatically)
- [ ] Test on staging store first
- [ ] Monitor API rate limits

---

## 12. Rate Limits

Shopify Storefront API limits:
- **1000 points per minute** (cost varies by query)
- Use caching to minimize requests
- Implement exponential backoff for retries

```typescript
// Implement caching
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async query<T>(query: string, variables?: any): Promise<T> {
  const cacheKey = JSON.stringify({ query, variables });
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await this.fetchFromAPI(query, variables);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  
  return data;
}
```

---

## Summary

1. ✅ Create Storefront API app in Shopify
2. ✅ Implement ShopifyClient for GraphQL queries
3. ✅ Create adapter to map Shopify products to catalog
4. ✅ Implement cart management with mutations
5. ✅ Update configurator to use Shopify data
6. ✅ Add "Add to Cart" functionality
7. ✅ Structure Shopify products with variants and metafields
8. ✅ Test end-to-end flow
9. ✅ Deploy with Shopify config

---

**Next Steps:**
1. Create Storefront API app
2. Implement API client
3. Test with real Shopify store
4. Add error handling and loading states
5. Optimize caching and performance
