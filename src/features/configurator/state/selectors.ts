import type { ConfiguratorStore } from "@/features/configurator/state/store";
import type { Money, Product } from "@/features/configurator/model/types";
import { getCabinetPrice } from "@/features/configurator/model/types";

export const selectCatalog = (s: ConfiguratorStore) => s.catalog;
export const selectActiveProductId = (s: ConfiguratorStore) => s.activeProductId;
export const selectQuantity = (s: ConfiguratorStore) => s.quantity;
export const selectSelectedOptions = (s: ConfiguratorStore) => s.selectedOptions;
export const selectRenderMode = (s: ConfiguratorStore) => s.renderMode;
export const selectPlacedCabinets = (s: ConfiguratorStore) => s.placedCabinets;

export const selectActiveProduct = (s: ConfiguratorStore): Product | undefined => {
  const catalog = selectCatalog(s);
  const id = selectActiveProductId(s);
  return catalog.products.find((p) => p.id === id);
};

export const selectTotalPrice = (s: ConfiguratorStore): Money => {
  const product = selectActiveProduct(s);
  const quantity = selectQuantity(s);
  const base = product?.basePrice ?? { amount: 0, currency: "CZK" as const };
  return { ...base, amount: base.amount * quantity };
};

export const selectPlacedCabinetsTotalPrice = (s: ConfiguratorStore): Money => {
  const placedCabinets = selectPlacedCabinets(s);
  
  const total = placedCabinets.reduce((sum, cabinet) => {
    const price = getCabinetPrice(cabinet.type, cabinet.size);
    return sum + price.amount;
  }, 0);
  
  return { amount: total, currency: "CZK" as const };
};

// Renderers should only depend on selectors, never on UI props.
export const selectRendererParams = (s: ConfiguratorStore) => {
  const product = selectActiveProduct(s);
  const selected = selectSelectedOptions(s);
  const placedCabinets = selectPlacedCabinets(s);

  const selectedColorId = selected["color"];
  const colorGroup = product?.optionGroups.find((g) => g.id === "color");
  const colorOption =
    colorGroup && colorGroup.kind === "swatches"
      ? colorGroup.options.find((o) => o.id === selectedColorId)
      : undefined;

  return {
    primaryColor: colorOption?.color ?? "#FFFFFF",
    placedCabinets
  };
};


