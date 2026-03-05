import { OptionsPanel } from "@/features/configurator/ui/OptionsPanel";
import { QuantityBar } from "@/features/configurator/ui/QuantityBar";
import { ButtonsPanel } from "@/features/configurator/ui/ButtonsPanel";

export function Configurator() {
  return (
    <div className="configurator-container w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <OptionsPanel />

      <QuantityBar />

      <div className="configurator-actions mt-4 !grid gap-4 md:!grid-cols-2">
        <ButtonsPanel />
      </div>
    </div>
  );
}


