import { OptionsPanel } from "@/features/configurator/ui/OptionsPanel";
import { QuantityBar } from "@/features/configurator/ui/QuantityBar";
import { ButtonsPanel } from "@/features/configurator/ui/ButtonsPanel";

export function Configurator() {
  return (
    <div className="configurator-container min-h-screen w-full bg-white">
      <OptionsPanel />

      <QuantityBar />

      <div className="configurator-actions mt-4 grid gap-4 md:grid-cols-2">
        <ButtonsPanel />
      </div>
    </div>
  );
}


