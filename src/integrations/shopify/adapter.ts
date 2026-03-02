import { Catalog, Product } from '@/features/configurator/model/types';
import type { PlatformAdapter } from '@/integrations/types';
import { ShopifyClient } from './client';

const GET_PRODUCTS = `
  query GetProducts($query: String) {
    products(first: 50, query: $query) {
      edges {
        node {
          id
          title
          handle
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
              }
            }
          }
          featuredImage {
            url
            altText
          }
        }
      }
    }
  }
`;

type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
      };
    }>;
  };
  featuredImage?: {
    url: string;
    altText?: string;
  };
};

type ShopifyProductsResponse = {
  products: {
    edges: Array<{
      node: ShopifyProduct;
    }>;
  };
};

export class ShopifyAdapter implements PlatformAdapter {
  constructor(private client: ShopifyClient) {}

  async fetchCatalog(): Promise<Catalog> {
    const data = await this.client.query<ShopifyProductsResponse>(GET_PRODUCTS, {
      query: 'tag:kitchen-configurator'
    });

    const products = data.products.edges.map((edge) => 
      this.mapProduct(edge.node)
    );

    return { products };
  }

  private mapProduct(shopifyProduct: ShopifyProduct): Product {
    // Parse handle: "kitchen-cabinet-upper-40cm" → type: "top", size: "40"
    const handle = shopifyProduct.handle.toLowerCase();
    const type = handle.includes('upper') ? 'top' : 'bottom';
    const sizeMatch = handle.match(/(\d+)cm/);
    const size = sizeMatch ? sizeMatch[1] : '40';

    // Shopify returns price as "3000.00", we need to convert to 3000 (integer)
    const priceAmount = Math.round(parseFloat(shopifyProduct.priceRange.minVariantPrice.amount));
    console.log(`💰 [Adapter] Product "${shopifyProduct.title}": ${priceAmount} ${shopifyProduct.priceRange.minVariantPrice.currencyCode}`);

    return {
      id: shopifyProduct.handle,
      title: shopifyProduct.title,
      subtitle: 'Kitchen Cabinet',
      basePrice: {
        amount: priceAmount,
        currency: shopifyProduct.priceRange.minVariantPrice.currencyCode
      },
      imageUrl: shopifyProduct.featuredImage?.url || undefined,
      optionGroups: [
        {
          id: 'color',
          kind: 'swatches',
          label: 'Barva',
          options: [
            { id: 'white', label: 'Bílá', color: '#FFFFFF' },
            { id: 'light-gray', label: 'Světle šedá', color: '#F3F4F6' },
            { id: 'beige', label: 'Béžová', color: '#F5F5DC' }
          ],
          defaultOptionId: 'white'
        }
      ],
      _shopify: {
        id: shopifyProduct.id,
        variantId: shopifyProduct.variants.edges[0].node.id,
        type,
        size
      }
    };
  }
}
