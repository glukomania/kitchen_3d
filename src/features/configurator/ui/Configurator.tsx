import { OptionsPanel } from "@/features/configurator/ui/OptionsPanel";
import { QuantityBar } from "@/features/configurator/ui/QuantityBar";
import { ButtonsPanel } from "@/features/configurator/ui/ButtonsPanel";
import { HostStorePreview } from "@/features/configurator/ui/HostStorePreview";

export function Configurator() {
  console.log('window.shoptet', window.shoptet)
  return (
    <div className="configurator-container w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <OptionsPanel />

      <HostStorePreview />

      <QuantityBar />

      <div className="configurator-actions mt-4 !grid gap-4 md:!grid-cols-2">
        <ButtonsPanel />
      </div>
    </div>
  );
}


