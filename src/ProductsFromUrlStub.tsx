/**
 * Stub: reads product price IDs from URL query (?products=1,2,3) and displays them.
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

export function ProductsFromUrlStub() {
  const ids = getPriceIdsFromUrl();

  return (
    <div className="products-from-url-stub min-h-screen bg-slate-100 p-8">
      <div className="products-from-url-stub-inner mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
