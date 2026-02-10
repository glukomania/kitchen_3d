import { useState } from "react";
import { useAppDispatch } from "@/app/hooks";
import { Button } from "@/features/configurator/ui/Button";

export function ButtonsPanel() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = async () => {
    console.log('🛒 [ButtonsPanel] Add to cart button clicked');
    setLoading(true);
    setError(null);

    try {
      console.log('🛒 [ButtonsPanel] Calling dispatch.addToCart()...');
      const checkoutUrl = await dispatch.addToCart();
      console.log('🛒 [ButtonsPanel] Got checkout URL:', checkoutUrl);
      console.log('🛒 [ButtonsPanel] Redirecting to checkout...');
      window.location.href = checkoutUrl;
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
        onClick={handleAddToCart}
      />
      
      {error && (
        <div className="text-sm text-red-600 mt-2">{error}</div>
      )}
      
      <Button title="Send request" />
    </div>
  );
}
