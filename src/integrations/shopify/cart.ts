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

export class ShopifyCart {
  private cartId: string | null = null;

  constructor(private client: ShopifyClient) {
    this.cartId = localStorage.getItem('shopify_cart_id');
  }

  async addItems(items: { variantId: string; quantity: number }[]): Promise<string> {
    const lines = items.map(item => ({
      merchandiseId: item.variantId,
      quantity: item.quantity
    }));

    if (!this.cartId) {
      const data = await this.client.query<any>(CREATE_CART, { lines });
      this.cartId = data.cartCreate.cart.id;
      localStorage.setItem('shopify_cart_id', this.cartId);
      return data.cartCreate.cart.checkoutUrl;
    } else {
      const data = await this.client.query<any>(ADD_TO_CART, {
        cartId: this.cartId,
        lines
      });
      return data.cartLinesAdd.cart.checkoutUrl;
    }
  }
}
