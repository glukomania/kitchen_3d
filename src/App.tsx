import { Configurator } from "@/features/configurator/ui/Configurator";

// Local dev shell (not part of the widget API).
export function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-6xl">
        <Configurator />
      </div>
    </div>
  );
}



