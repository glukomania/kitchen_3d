import { create } from "zustand";
import { sampleCatalog } from "@/features/configurator/data/sampleCatalog";
import type { Catalog, Id, SelectedOptions, PlacedCabinet } from "@/features/configurator/model/types";

export type RenderMode = "2d" | "three";

export type ConfiguratorState = {
  catalog: Catalog;
  activeProductId: Id;
  quantity: number;
  selectedOptions: SelectedOptions;
  renderMode: RenderMode;
  placedCabinets: PlacedCabinet[];
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
};

export type ConfiguratorStore = ConfiguratorState & ConfiguratorActions;

export const useConfiguratorStore = create<ConfiguratorStore>((set) => ({
  catalog: sampleCatalog,
  activeProductId: initialProductId,
  quantity: 1,
  selectedOptions: getDefaultSelectedOptions(sampleCatalog, initialProductId),
  renderMode: "2d",
  placedCabinets: [],

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
    }))
}));
