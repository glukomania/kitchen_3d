import { Catalog, Product } from '@/features/configurator/model/types';
import type { PlatformAdapter } from '@/integrations/types';
import { ShoptetClient } from './client';

type ShoptetProduct = {
  guid: string;
  code: string;
  name: string;
  shortDescription: string;
  price: number;
  currency: string;
  image?: {
    url: string;
  };
  variants?: Array<{
    guid: string;
    name: string;
  }>;
};

type ShoptetProductsResponse = {
  products: ShoptetProduct[];
};

export class ShoptetAdapter implements PlatformAdapter {
  constructor(private client: ShoptetClient) {}

  async fetchCatalog(): Promise<Catalog> {
    // Fetch products with tag "kitchen-configurator"
    // Note: Adjust the endpoint based on actual Shoptet API
    const data = await this.client.get<ShoptetProductsResponse>(
      '/products?tag=kitchen-configurator'
    );

    const products = data.products.map((product) => 
      this.mapProduct(product)
    );

    return { products };
  }

  private mapProduct(shoptetProduct: ShoptetProduct): Product {
    // Parse product code: "kitchen-cabinet-upper-40cm" → type: "top", size: "40"
    const code = shoptetProduct.code.toLowerCase();
    const type = code.includes('upper') ? 'top' : 'bottom';
    const sizeMatch = code.match(/(\d+)cm/);
    const size = sizeMatch ? sizeMatch[1] : '40';

    console.log(`💰 [Shoptet Adapter] Product "${shoptetProduct.name}": ${shoptetProduct.price} ${shoptetProduct.currency}`);

    return {
      id: shoptetProduct.code,
      title: shoptetProduct.name,
      subtitle: shoptetProduct.shortDescription || 'Kitchen Cabinet',
      basePrice: {
        amount: Math.round(shoptetProduct.price),
        currency: shoptetProduct.currency
      },
      imageUrl: shoptetProduct.image?.url,
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
      _shoptet: {
        guid: shoptetProduct.guid,
        variantId: shoptetProduct.variants?.[0]?.guid || shoptetProduct.guid,
        type,
        size
      }
    };
  }
}
