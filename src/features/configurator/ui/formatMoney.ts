import type { Money } from "@/features/configurator/model/types";

export function formatMoney(m: Money) {
  try {
    return new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: m.currency,
      maximumFractionDigits: 0
    }).format(m.amount);
  } catch {
    return `${m.amount} ${m.currency}`;
  }
}



