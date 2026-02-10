export type ShopifyConfig = {
  domain: string;
  storefrontAccessToken: string;
};

export class ShopifyClient {
  private endpoint: string;
  private headers: HeadersInit;

  constructor(config: ShopifyConfig) {
    this.endpoint = `https://${config.domain}/api/2024-01/graphql.json`;
    this.headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': config.storefrontAccessToken
    };
  }

  async query<T>(query: string, variables?: any): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query, variables })
    });

    const { data, errors } = await response.json();
    if (errors) throw new Error(errors[0].message);
    return data;
  }
}
