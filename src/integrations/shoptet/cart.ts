import type { PlatformCart, CartItem } from '@/integrations/types';
import { ShoptetClient } from './client';

type ShoptetCartItem = {
  productGuid: string;
  amount: number;
};

type ShoptetCartResponse = {
  cartUrl: string;
};

export class ShoptetCart implements PlatformCart {
  constructor(private client: ShoptetClient) {}

  async addItems(items: CartItem[]): Promise<string> {
    const cartItems: ShoptetCartItem[] = items.map(item => ({
      productGuid: item.variantId,
      amount: item.quantity
    }));

    // Add items to cart via Shoptet API
    const response = await this.client.post<ShoptetCartResponse>(
      '/cart/add-cart-items',
      { cartItems }
    );

    return response.cartUrl;
  }
}
