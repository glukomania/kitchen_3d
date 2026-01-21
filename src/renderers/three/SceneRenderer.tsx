import { useEffect, useRef } from "react";
import { useAppSelector } from "@/app/hooks";
import { selectRendererParams } from "@/features/configurator/state/selectors";
import { Scene3D } from "@/renderers/three/scene/Scene3D";

export function SceneRenderer() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<Scene3D | null>(null);
  const params = useAppSelector(selectRendererParams);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new Scene3D(mount);
    sceneRef.current = scene;
    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    sceneRef.current?.changeColor(params.primaryColor);
  }, [params.primaryColor]);

  useEffect(() => {
    if (!sceneRef.current || !mountRef.current) return;
    const viewportWidth = mountRef.current.clientWidth || 800;
    const viewportHeight = mountRef.current.clientHeight || 600;
    sceneRef.current.updateCabinets(params.placedCabinets, viewportWidth, viewportHeight);
  }, [params.placedCabinets]);

  return <div ref={mountRef} className="h-full w-full rounded-xl" style={{ backgroundColor: "#f9f0dc" }} />;
}



