import { useEffect } from "react";

/**
 * Stub: reads product price IDs from URL query (?products=1,2,3),
 * displays them and adds to cart via Shoptet API when available.
 */

function getPriceIdsFromUrl(): number[] {
  if (typeof window === "undefined") return [];
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("products");
  if (!raw) return [];
  return raw
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((n) => !Number.isNaN(n));
}

function addProductsFromUrlToCart(ids: number[]): void {
  const shoptet = typeof window !== "undefined" ? (window as Window & { shoptet?: { cartShared?: { addToCart: (opts: { priceId: number; amount: number }) => void } } }).shoptet : undefined;
  const addToCart = shoptet?.cartShared?.addToCart;
  console.log('getShoptetProductsList', window.getShoptetProductsList());
  console.log('getShoptetDataLayer', getShoptetDataLayer());
  console.log('window', window);
  if (!addToCart || ids.length === 0) return;
  ids.forEach((priceId) => addToCart({ priceId, amount: 1 }));
}

export function ProductsFromUrlStub() {
  const ids = getPriceIdsFromUrl();

  useEffect(() => {
    addProductsFromUrlToCart(getPriceIdsFromUrl());
  }, []);

  return (
    <div className="products-from-url-stub h-[200px] w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="products-from-url-stub-inner">
        <p className="products-from-url-stub-title font-medium text-slate-800">
          Produkty:
        </p>
        {ids.length === 0 ? (
          <p className="products-from-url-stub-empty mt-2 text-sm text-slate-500">
            (no products in URL; use ?products=1,2,3)
          </p>
        ) : (
          <ul className="products-from-url-stub-list mt-2 list-none space-y-1 text-slate-700">
            {ids.map((id, i) => (
              <li key={`${id}-${i}`}>priceId: {id}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
