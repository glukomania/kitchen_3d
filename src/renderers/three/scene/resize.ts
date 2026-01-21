import type * as THREE from "three";
import type { ResizeInfo } from "./types";

export function computeSafeCanvasSize(params: ResizeInfo) {
  const { cssWidth, cssHeight, pixelRatio, maxTextureSize } = params;

  const maxTex = maxTextureSize || 8192;
  const maxCssSize = Math.max(1, Math.floor(maxTex / pixelRatio));

  return {
    width: Math.min(cssWidth, maxCssSize),
    height: Math.min(cssHeight, maxCssSize)
  };
}

export function applyResize(params: {
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  cssWidth: number;
  cssHeight: number;
}) {
  if (params.cssWidth <= 0 || params.cssHeight <= 0) return;

  const pixelRatio = params.renderer.getPixelRatio();
  const maxTextureSize = params.renderer.capabilities.maxTextureSize || 8192;
  const { width, height } = computeSafeCanvasSize({
    cssWidth: params.cssWidth,
    cssHeight: params.cssHeight,
    pixelRatio,
    maxTextureSize
  });

  params.camera.aspect = width / height;
  params.camera.updateProjectionMatrix();
  params.renderer.setSize(width, height, false);
}



