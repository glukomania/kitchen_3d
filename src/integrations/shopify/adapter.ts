import { Catalog, Product } from '@/features/configurator/model/types';
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

export class ShopifyAdapter {
  constructor(private client: ShopifyClient) {}

  async fetchCatalog(): Promise<Catalog> {
    const data = await this.client.query<any>(GET_PRODUCTS, {
      query: 'tag:kitchen-configurator'
    });

    const products = data.products.edges.map((edge: any) => 
      this.mapProduct(edge.node)
    );

    return { products };
  }

  private mapProduct(shopifyProduct: any): Product {
    // Parse handle: "kitchen-cabinet-upper-40cm" → type: "top", size: "40"
    const handle = shopifyProduct.handle.toLowerCase();
    const type = handle.includes('upper') ? 'top' : 'bottom';
    const sizeMatch = handle.match(/(\d+)cm/);
    const size = sizeMatch ? sizeMatch[1] : '40';

    return {
      id: shopifyProduct.handle,
      title: shopifyProduct.title,
      subtitle: 'Kitchen Cabinet',
      basePrice: {
        amount: Math.round(parseFloat(shopifyProduct.priceRange.minVariantPrice.amount) * 100),
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
