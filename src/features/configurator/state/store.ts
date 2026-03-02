import { create } from "zustand";
import { sampleCatalog } from "@/features/configurator/data/sampleCatalog";
import type { Catalog, Id, SelectedOptions, PlacedCabinet } from "@/features/configurator/model/types";
import type { PlatformConfig, PlatformAdapter, PlatformCart } from "@/integrations/types";
import { PlatformFactory } from "@/integrations/factory";
// Legacy support
import { ShopifyConfig } from "@/integrations/shopify/client";

export type RenderMode = "2d" | "three";

export type ConfiguratorState = {
  catalog: Catalog;
  activeProductId: Id;
  quantity: number;
  selectedOptions: SelectedOptions;
  renderMode: RenderMode;
  placedCabinets: PlacedCabinet[];
  platformAdapter: PlatformAdapter | null;
  platformCart: PlatformCart | null;
  platformType: 'shopify' | 'shoptet' | null;
};

function getDefaultSelectedOptions(catalog: Catalog, productId: Id): SelectedOptions {
  const product = catalog.products.find((p) => p.id === productId);
  if (!product) return {};
  return Object.fromEntries(
    product.optionGroups.map((g) => [g.id, g.defaultOptionId])
  ) as SelectedOptions;
}

const initialProductId = sampleCatalog.products[0]?.id ?? "default";

type ConfiguratorActions = {
  setQuantity: (quantity: number) => void;
  setActiveProduct: (productId: Id) => void;
  setOption: (payload: { groupId: Id; optionId: Id }) => void;
  setCatalog: (catalog: Catalog) => void;
  setRenderMode: (mode: RenderMode) => void;
  addCabinet: (cabinet: Omit<PlacedCabinet, "id" | "rotation">) => void;
  moveCabinet: (cabinetId: Id, x: number, y: number) => void;
  rotateCabinet: (cabinetId: Id, rotation: number) => void;
  removeCabinet: (cabinetId: Id) => void;
  initPlatform: (config: PlatformConfig) => Promise<void>;
  initShopify: (config: ShopifyConfig) => Promise<void>; // Legacy support
  addToCart: () => Promise<string>;
};

export type ConfiguratorStore = ConfiguratorState & ConfiguratorActions;

export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  catalog: sampleCatalog,
  activeProductId: initialProductId,
  quantity: 1,
  selectedOptions: getDefaultSelectedOptions(sampleCatalog, initialProductId),
  renderMode: "2d",
  placedCabinets: [],
  platformAdapter: null,
  platformCart: null,
  platformType: null,

  setQuantity: (quantity) =>
    set({ quantity: Math.max(1, Math.floor(quantity)) }),

  setActiveProduct: (productId) =>
    set((state) => ({
      activeProductId: productId,
      selectedOptions: getDefaultSelectedOptions(state.catalog, productId)
    })),

  setOption: (payload) =>
    set((state) => ({
      selectedOptions: {
        ...state.selectedOptions,
        [payload.groupId]: payload.optionId
      }
    })),

  setCatalog: (catalog) => {
    const productId = catalog.products[0]?.id ?? "default";
    set({
      catalog,
      activeProductId: productId,
      selectedOptions: getDefaultSelectedOptions(catalog, productId)
    });
  },

  setRenderMode: (mode) => set({ renderMode: mode }),

  addCabinet: (cabinet) =>
    set((state) => ({
      placedCabinets: [
        ...state.placedCabinets,
        { ...cabinet, rotation: 0, id: `cabinet-${Date.now()}-${Math.random()}` }
      ]
    })),

  moveCabinet: (cabinetId, x, y) =>
    set((state) => ({
      placedCabinets: state.placedCabinets.map((cabinet) =>
        cabinet.id === cabinetId ? { ...cabinet, x, y } : cabinet
      )
    })),

  rotateCabinet: (cabinetId, rotation) =>
    set((state) => ({
      placedCabinets: state.placedCabinets.map((cabinet) =>
        cabinet.id === cabinetId ? { ...cabinet, rotation } : cabinet
      )
    })),

  removeCabinet: (cabinetId) =>
    set((state) => ({
      placedCabinets: state.placedCabinets.filter((cabinet) => cabinet.id !== cabinetId)
    })),

  initPlatform: async (config: PlatformConfig) => {
    console.log('🔧 [Store] Initializing platform:', config.type);
    
    const adapter = PlatformFactory.createAdapter(config);
    const cart = PlatformFactory.createCart(config);

    console.log('🔧 [Store] Fetching catalog from', config.type, '...');
    const catalog = await adapter.fetchCatalog();
    console.log('🔧 [Store] Catalog fetched:', catalog.products.length, 'products');

    set({
      platformAdapter: adapter,
      platformCart: cart,
      platformType: config.type,
      catalog,
      activeProductId: catalog.products[0]?.id ?? 'default',
      selectedOptions: getDefaultSelectedOptions(catalog, catalog.products[0]?.id ?? 'default')
    });
    console.log('✅ [Store] Platform initialized successfully:', config.type);
  },

  // Legacy support for Shopify
  initShopify: async (config: ShopifyConfig) => {
    console.log('🔧 [Store] Legacy initShopify called, redirecting to initPlatform');
    await get().initPlatform({ ...config, type: 'shopify' });
  },

  addToCart: async () => {
    console.log('🛒 [Store] addToCart called');
    const { platformCart, platformType, placedCabinets, catalog } = get();
    
    console.log('🛒 [Store] Placed cabinets:', placedCabinets);
    console.log('🛒 [Store] Catalog products:', catalog.products.length);
    console.log('🛒 [Store] Platform type:', platformType);
    
    // No platform: return empty string so UI can show stub message without crashing
    if (!platformCart) {
      console.warn('⚠️ [Store] Platform not initialized — add to cart is a no-op');
      return '';
    }

    if (placedCabinets.length === 0) {
      console.warn('⚠️ [Store] No cabinets placed!');
      throw new Error('Please add at least one cabinet to the configurator');
    }

    const items = placedCabinets.map(cabinet => {
      let product;
      let variantId;

      // Find product based on platform type
      if (platformType === 'shopify') {
        product = catalog.products.find(p => 
          p._shopify?.type === cabinet.type && 
          p._shopify?.size === cabinet.size
        );
        variantId = product?._shopify?.variantId;
      } else if (platformType === 'shoptet') {
        product = catalog.products.find(p => 
          p._shoptet?.type === cabinet.type && 
          p._shoptet?.size === cabinet.size
        );
        variantId = product?._shoptet?.variantId;
      }

      if (!product || !variantId) {
        console.error('❌ [Store] Product not found for cabinet:', cabinet);
        throw new Error(`Product not found for cabinet: ${cabinet.type} ${cabinet.size}`);
      }

      console.log('🛒 [Store] Adding item:', { 
        product: product.title, 
        variantId 
      });

      return {
        variantId,
        quantity: 1
      };
    });

    console.log('🛒 [Store] Cart items:', items);
    const checkoutUrl = await platformCart.addItems(items);
    console.log('✅ [Store] Checkout URL:', checkoutUrl);
    return checkoutUrl;
  }
}));
