/**
 * Reads product list from the host page DOM when the widget is embedded (e.g. in Shoptet).
 * Uses container id="products-1" as per host structure.
 */

export type HostProductItem = {
  name: string;
  url?: string;
};

export type HostStoreScanResult = {
  found: boolean;
  count: number;
  items: HostProductItem[];
};

const PRODUCTS_CONTAINER_ID = "products-1";

/**
 * Scans the given document for product list container #products-1 and extracts
 * product names/links. Safe to call with null (returns not found).
 */
export function getHostProductList(doc: Document | null): HostStoreScanResult {
  if (!doc || typeof doc.getElementById !== "function") {
    return { found: false, count: 0, items: [] };
  }

  const container = doc.getElementById(PRODUCTS_CONTAINER_ID);
  if (!container) {
    return { found: false, count: 0, items: [] };
  }

  // Collect links inside the container (typical for product grids)
  const links = container.querySelectorAll<HTMLAnchorElement>("a[href]");
  const items: HostProductItem[] = [];
  const seen = new Set<string>();

  links.forEach((a) => {
    const url = a.getAttribute("href") ?? undefined;
    const name = (a.textContent ?? "").trim();
    if (!name) return;
    // Dedupe by name
    if (seen.has(name)) return;
    seen.add(name);
    items.push({ name, url });
  });

  // If no links found, try direct children text (e.g. product cards with headings)
  if (items.length === 0) {
    const children = container.children;
    for (let i = 0; i < children.length; i++) {
      const el = children[i];
      const heading = el.querySelector("h2, h3, .product-name, a");
      const name = (heading?.textContent ?? el.textContent ?? "").trim().slice(0, 80);
      if (name) items.push({ name });
    }
  }

  return {
    found: true,
    count: items.length,
    items
  };
}
