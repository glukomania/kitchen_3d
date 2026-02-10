import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  selectActiveProduct,
  selectSelectedOptions,
  selectCatalog
} from "@/features/configurator/state/selectors";
import { FieldLabel } from "@/shared/ui/components/FieldLabel";
import { SwatchRow } from "@/shared/ui/components/SwatchRow";
import { RenderPanel } from "@/features/configurator/ui/RenderPanel";
import { CabinetItem } from "@/features/configurator/ui/CabinetItem";

export function OptionsPanel() {
  const dispatch = useAppDispatch();
  const product = useAppSelector(selectActiveProduct);
  const selected = useAppSelector(selectSelectedOptions);
  const catalog = useAppSelector(selectCatalog);

  const groups = useMemo(() => product?.optionGroups ?? [], [product]);
  const title = useMemo(() => product?.title ?? "Configurator", [product]);
  const subtitle = useMemo(() => product?.subtitle ?? "", [product]);

  // Generate cabinet items from Shopify products
  const cabinetItems = useMemo(() => {
    return catalog.products
      .filter(p => p._shopify?.type && p._shopify?.size)
      .map(p => ({
        type: p._shopify!.type,
        size: p._shopify!.size,
        label: p.title,
        id: p.id,
        imageUrl: p.imageUrl,
        price: p.basePrice
      }))
      .sort((a, b) => {
        // Sort: top first, then by size
        if (a.type !== b.type) return a.type === 'top' ? -1 : 1;
        return parseInt(a.size) - parseInt(b.size);
      });
  }, [catalog]);

  return (
    <div className="configurator-options-panel !grid gap-6 md:!grid-cols-[420px_1fr]">
      <div className="configurator-options-section">
        <div className="configurator-header mb-6">
          <div className="configurator-title text-4xl font-semibold text-slate-900">{title}</div>
          {subtitle ? <div className="configurator-subtitle text-slate-500">{subtitle}</div> : null}
        </div>

        <div className="configurator-options-list space-y-5">
          {groups.map((g) => {
            // Only show color swatches, skip select fields (size dropdowns)
            if (g.kind === "select") return null;
            
            const value = selected[g.id] ?? g.defaultOptionId;
            return (
              <div key={g.id} className="configurator-option-group">
                <FieldLabel>{g.label}</FieldLabel>
                <SwatchRow
                  value={value}
                  onChange={(optionId) =>
                    dispatch.setOption({ groupId: g.id, optionId })
                  }
                  swatches={g.options.map((o) => ({ id: o.id, label: o.label, color: o.color }))}
                />
              </div>
            );
          })}

          <div className="configurator-cabinets-section">
            <FieldLabel>Skříňky</FieldLabel>
            <div className="configurator-cabinets-grid mt-2 !grid !grid-cols-2 gap-3">
              {cabinetItems.map((item) => (
                <CabinetItem 
                  key={item.id}
                  type={item.type} 
                  size={item.size} 
                  label={item.label}
                  imageUrl={item.imageUrl}
                  price={item.price}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <RenderPanel />
    </div>
  );
}


