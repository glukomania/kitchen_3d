import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/features/configurator/ui/Button";

export function ButtonsPanel() {
  const dispatch = useAppDispatch();
  const platformCart = useAppSelector((s) => s.platformCart);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPlatform = platformCart != null;

  const getPriceIdsFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('products');
    if (!raw) return [];
    return raw.split(',').map(id => Number(id));
  }

  function addSelectedProductsToCart() {
    const ids = getPriceIdsFromUrl();
  
    ids.forEach(priceId => {
      window.shoptet.cartShared.addToCart({
        priceId,
        amount: 1
      });
    });
  }

  const handleAddToCart = async () => {
    console.log('🛒 [ButtonsPanel] Add to cart button clicked');
    console.log('Add to cart', window.shoptet.cartShared.addToCart({ priceId: 14, amount: 1 }))
    setLoading(true);
    setError(null);

    try {
      const checkoutUrl = await dispatch.addToCart();
      setLoading(false);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        setError('Add to cart is available when embedded in Shopify or Shoptet.');
      }
    } catch (err) {
      console.error('❌ [ButtonsPanel] Error adding to cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
      setLoading(false);
    }
  };

  return (
    <div className="configurator-buttons-panel">
      <Button
        title={loading ? 'Adding to cart...' : 'Add to cart'}
        onClick={() => void addSelectedProductsToCart()}
        // disabled={!hasPlatform}
      />
      {!hasPlatform && (
        <p className="configurator-buttons-panel-stub text-sm text-gray-500 mt-2">
          Add to cart is available when the configurator is embedded in Shopify or Shoptet.
        </p>
      )}
      {error && (
        <div className="configurator-buttons-panel-error text-sm text-red-600 mt-2">{error}</div>
      )}
      <Button title="Send request" />
    </div>
  );
}
