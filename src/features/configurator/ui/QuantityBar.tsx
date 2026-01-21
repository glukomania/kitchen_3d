import { useAppSelector } from "@/app/hooks";
import { selectPlacedCabinetsTotalPrice } from "@/features/configurator/state/selectors";
import { formatMoney } from "@/features/configurator/ui/formatMoney";

export function QuantityBar() {
  const total = useAppSelector(selectPlacedCabinetsTotalPrice);

  return (
    <div className="configurator-quantity-bar mt-6 flex flex-col gap-4 rounded-xl bg-slate-800 px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-end">
      <div className="configurator-price w-full text-left sm:w-auto sm:text-right">
        <div className="configurator-price-label text-sm opacity-80">Celková cena</div>
        <div className="configurator-price-value text-3xl font-semibold">{formatMoney(total)}</div>
      </div>
    </div>
  );
}


