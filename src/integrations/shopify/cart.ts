import type { PlatformCart, CartItem } from '@/integrations/types';
import { ShopifyClient } from './client';

const CREATE_CART = `
  mutation CreateCart($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        checkoutUrl
      }
    }
  }
`;

const ADD_TO_CART = `
  mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        checkoutUrl
      }
    }
  }
`;

type CartLine = {
  merchandiseId: string;
  quantity: number;
};

type CreateCartResponse = {
  cartCreate: {
    cart: {
      id: string;
      checkoutUrl: string;
    };
  };
};

type AddToCartResponse = {
  cartLinesAdd: {
    cart: {
      checkoutUrl: string;
    };
  };
};

export class ShopifyCart implements PlatformCart {
  private cartId: string | null = null;

  constructor(private client: ShopifyClient) {
    this.cartId = localStorage.getItem('shopify_cart_id');
  }

  async addItems(items: CartItem[]): Promise<string> {
    const lines: CartLine[] = items.map(item => ({
      merchandiseId: item.variantId,
      quantity: item.quantity
    }));

    if (!this.cartId) {
      const data = await this.client.query<CreateCartResponse>(CREATE_CART, { lines });
      this.cartId = data.cartCreate.cart.id;
      localStorage.setItem('shopify_cart_id', this.cartId);
      return data.cartCreate.cart.checkoutUrl;
    } else {
      const data = await this.client.query<AddToCartResponse>(ADD_TO_CART, {
        cartId: this.cartId,
        lines
      });
      return data.cartLinesAdd.cart.checkoutUrl;
    }
  }
}
