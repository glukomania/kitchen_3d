import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { selectRenderMode } from "@/features/configurator/state/selectors";
import { SceneRenderer } from "@/renderers/three/SceneRenderer";
import { TwoDRenderer } from "@/renderers/2d/TwoDRenderer";

export function RenderPanel() {
  const dispatch = useAppDispatch();
  const renderMode = useAppSelector(selectRenderMode);

  const toggleRenderMode = () => {
    dispatch.setRenderMode(renderMode === "2d" ? "three" : "2d");
  };

  return (
    <div className="configurator-render-panel !flex !min-h-[450px] !flex-col">
      <div className="configurator-render-viewport !flex-1">
        {renderMode === "2d" ? <TwoDRenderer /> : <SceneRenderer />}
      </div>
      <div className="configurator-render-actions mt-4 !flex !items-center !justify-between">
        <button
          type="button"
          onClick={toggleRenderMode}
          className="configurator-render-toggle-button rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {renderMode === "2d" ? "3D zobrazení" : "2D zobrazení"}
        </button>
        <button
          type="button"
          className="configurator-download-button text-sm font-medium text-slate-700 underline underline-offset-4 hover:text-slate-900"
        >
          Stáhnout 3D model
        </button>
      </div>
    </div>
  );
}
