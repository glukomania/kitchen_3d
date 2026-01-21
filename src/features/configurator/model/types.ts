export type Id = string;

export type OptionId = Id;
export type OptionGroupId = Id;

export type Money = {
  amount: number;
  currency: "CZK" | "EUR" | "USD";
};

export type Swatch = {
  id: OptionId;
  label: string;
  // Hex without alpha, e.g. "#111111"
  color: string;
};

export type SelectOption = {
  id: OptionId;
  label: string;
};

export type OptionGroup =
  | {
      id: OptionGroupId;
      kind: "select";
      label: string;
      options: SelectOption[];
      defaultOptionId: OptionId;
    }
  | {
      id: OptionGroupId;
      kind: "swatches";
      label: string;
      options: Swatch[];
      defaultOptionId: OptionId;
    };

export type Product = {
  id: Id;
  title: string;
  subtitle?: string;
  basePrice: Money;
  optionGroups: OptionGroup[];
};

export type Catalog = {
  products: Product[];
};

export type SelectedOptions = Record<OptionGroupId, OptionId>;

export type CabinetType = "top" | "bottom";
export type CabinetSize = "40" | "60";

export type PlacedCabinet = {
  id: Id;
  type: CabinetType;
  size: CabinetSize;
  x: number;
  y: number;
  rotation: number; // Rotation angle in degrees (0, 90, 180, 270)
};

// Cabinet prices based on type and size
export const CABINET_PRICES: Record<CabinetType, Record<CabinetSize, Money>> = {
  top: {
    "40": { amount: 2500, currency: "CZK" },
    "60": { amount: 3500, currency: "CZK" }
  },
  bottom: {
    "40": { amount: 3000, currency: "CZK" },
    "60": { amount: 4500, currency: "CZK" }
  }
};

export function getCabinetPrice(type: CabinetType, size: CabinetSize): Money {
  return CABINET_PRICES[type][size];
}



