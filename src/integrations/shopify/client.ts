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

    if (!response.ok) {
      const text = await response.text();
      console.error('Shopify API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: text,
        endpoint: this.endpoint,
        headers: this.headers
      });
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const { data, errors } = await response.json();
    if (errors) {
      console.error('GraphQL errors:', errors);
      throw new Error(errors[0].message);
    }
    return data;
  }
}
