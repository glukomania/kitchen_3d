import type { Catalog } from "@/features/configurator/model/types";

export const sampleCatalog: Catalog = {
  products: [
    {
      id: "kitchen",
      title: "Kuchyň",
      subtitle: "Konfigurátor kuchyně",
      basePrice: { amount: 50000, currency: "CZK" },
      optionGroups: [
        {
          id: "color",
          kind: "swatches",
          label: "Barva",
          options: [
            { id: "white", label: "Bílá", color: "#FFFFFF" },
            { id: "light-gray", label: "Světle šedá", color: "#F3F4F6" },
            { id: "beige", label: "Béžová", color: "#F5F5DC" }
          ],
          defaultOptionId: "white"
        },
        {
          id: "top-cabinets",
          kind: "select",
          label: "Horní skříňky",
          options: [
            { id: "top-40", label: "40 cm" },
            { id: "top-60", label: "60 cm" }
          ],
          defaultOptionId: "top-40"
        },
        {
          id: "bottom-cabinets",
          kind: "select",
          label: "Dolní skříňky",
          options: [
            { id: "bottom-40", label: "40 cm" },
            { id: "bottom-60", label: "60 cm" }
          ],
          defaultOptionId: "bottom-40"
        }
      ]
    }
  ]
};



