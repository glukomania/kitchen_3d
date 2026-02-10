import { create } from "zustand";
import { sampleCatalog } from "@/features/configurator/data/sampleCatalog";
import type { Catalog, Id, SelectedOptions, PlacedCabinet } from "@/features/configurator/model/types";
import { ShopifyClient, ShopifyConfig } from "@/integrations/shopify/client";
import { ShopifyAdapter } from "@/integrations/shopify/adapter";
import { ShopifyCart } from "@/integrations/shopify/cart";

export type RenderMode = "2d" | "three";

export type ConfiguratorState = {
  catalog: Catalog;
  activeProductId: Id;
  quantity: number;
  selectedOptions: SelectedOptions;
  renderMode: RenderMode;
  placedCabinets: PlacedCabinet[];
  shopifyClient: ShopifyClient | null;
  shopifyCart: ShopifyCart | null;
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
  initShopify: (config: ShopifyConfig) => Promise<void>;
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
  shopifyClient: null,
  shopifyCart: null,

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

  initShopify: async (config: ShopifyConfig) => {
    const client = new ShopifyClient(config);
    const adapter = new ShopifyAdapter(client);
    const cart = new ShopifyCart(client);

    const catalog = await adapter.fetchCatalog();

    set({
      shopifyClient: client,
      shopifyCart: cart,
      catalog,
      activeProductId: catalog.products[0]?.id ?? 'default',
      selectedOptions: getDefaultSelectedOptions(catalog, catalog.products[0]?.id ?? 'default')
    });
  },

  addToCart: async () => {
    const { shopifyCart, placedCabinets, catalog } = get();
    if (!shopifyCart) throw new Error('Shopify not initialized');

    const items = placedCabinets.map(cabinet => {
      const product = catalog.products.find(p => 
        p._shopify?.type === cabinet.type && 
        p._shopify?.size === cabinet.size
      );

      if (!product?._shopify?.variantId) {
        throw new Error(`Product not found for cabinet: ${cabinet.type} ${cabinet.size}`);
      }

      return {
        variantId: product._shopify.variantId,
        quantity: 1
      };
    });

    return await shopifyCart.addItems(items);
  }
}));
