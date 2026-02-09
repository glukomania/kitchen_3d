import type { CabinetType, CabinetSize } from "@/features/configurator/model/types";
import { getCabinetPrice } from "@/features/configurator/model/types";
import { formatMoney } from "@/features/configurator/ui/formatMoney";

type Props = {
  type: CabinetType;
  size: CabinetSize;
  label: string;
};

export function CabinetItem(props: Props) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ type: props.type, size: props.size }));
  };

  const getImagePath = () => {
    const typeStr = props.type === "top" ? "upper" : "bottom";
    // Files from public/ are copied to dist/ root
    // For widget embedded on external sites, use full GitHub Pages URL
    const base = import.meta.env.BASE_URL || '/kitchen_3d/';
    return `https://glukomania.github.io${base}${props.size}_${typeStr}.png`;
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="configurator-cabinet-item group relative cursor-move overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
    >
      <div className="configurator-cabinet-item-image mb-3 flex items-center justify-center rounded-lg p-3">
        <img
          src={getImagePath()}
          alt={props.label}
          className="configurator-cabinet-item-img h-24 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
        />
      </div>
      <div className="configurator-cabinet-item-label mb-1 text-sm font-semibold text-slate-900">
        {props.label}
      </div>
      <div className="configurator-cabinet-item-price text-base font-bold text-slate-900">
        {formatMoney(getCabinetPrice(props.type, props.size))}
      </div>
      <div className="configurator-cabinet-item-drag-hint absolute right-2 top-2 opacity-0 transition-opacity duration-200 group-hover:opacity-30">
        <svg
          className="h-5 w-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>
    </div>
  );
}
