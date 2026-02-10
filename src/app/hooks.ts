import { useConfiguratorStore } from "@/features/configurator/state/store";
import type { ConfiguratorStore } from "@/features/configurator/state/store";

// Typed hooks for Zustand store
export const useAppSelector = <T>(selector: (state: ConfiguratorStore) => T): T => {
  return useConfiguratorStore(selector);
};

export const useAppDispatch = () => {
  return useConfiguratorStore((state) => ({
    setQuantity: state.setQuantity,
    setActiveProduct: state.setActiveProduct,
    setOption: state.setOption,
    setCatalog: state.setCatalog,
    setRenderMode: state.setRenderMode,
    addCabinet: state.addCabinet,
    moveCabinet: state.moveCabinet,
    rotateCabinet: state.rotateCabinet,
    removeCabinet: state.removeCabinet,
    initShopify: state.initShopify,
    addToCart: state.addToCart
  }));
};
