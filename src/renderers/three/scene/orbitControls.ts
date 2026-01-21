import * as THREE from "three";

export type OrbitControls = {
  attach: (dom: HTMLElement) => void;
  detach: () => void;
  setRadius: (radius: number) => void;
  getRadius: () => number;
};

export function createOrbitControls(params: {
  camera: THREE.PerspectiveCamera;
  target: THREE.Vector3;
  minRadius?: number;
  maxRadius?: number;
}): OrbitControls {
  const minRadius = params.minRadius ?? 0.9;
  const maxRadius = params.maxRadius ?? 8;

  const tmpOffset = new THREE.Vector3();
  const spherical = new THREE.Spherical();
  spherical.setFromVector3(params.camera.position.clone().sub(params.target));

  const state = {
    dom: null as HTMLElement | null,
    dragging: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startTheta: spherical.theta,
    startPhi: spherical.phi
  };

  const apply = () => {
    tmpOffset.setFromSpherical(spherical);
    params.camera.position.copy(params.target).add(tmpOffset);
    params.camera.lookAt(params.target);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (!state.dom) return;
    state.dragging = true;
    state.pointerId = e.pointerId;
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.startTheta = spherical.theta;
    state.startPhi = spherical.phi;
    state.dom.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!state.dragging || e.pointerId !== state.pointerId) return;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;

    const rotSpeed = 0.005;
    spherical.theta = state.startTheta - dx * rotSpeed;
    spherical.phi = state.startPhi - dy * rotSpeed;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi, 0.12, Math.PI - 0.12);

    apply();
  };

  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerId !== state.pointerId) return;
    state.dragging = false;
    state.pointerId = -1;
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.0015;
    const nextRadius = spherical.radius * (1 + e.deltaY * zoomSpeed);
    spherical.radius = THREE.MathUtils.clamp(nextRadius, minRadius, maxRadius);
    apply();
  };

  return {
    attach(dom: HTMLElement) {
      state.dom = dom;
      dom.addEventListener("pointerdown", onPointerDown);
      dom.addEventListener("pointermove", onPointerMove);
      dom.addEventListener("pointerup", onPointerUp);
      dom.addEventListener("pointercancel", onPointerUp);
      dom.addEventListener("wheel", onWheel, { passive: false });
    },
    detach() {
      if (!state.dom) return;
      const dom = state.dom;
      state.dom = null;
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("pointercancel", onPointerUp);
      dom.removeEventListener("wheel", onWheel);
    },
    setRadius(radius: number) {
      spherical.radius = THREE.MathUtils.clamp(radius, minRadius, maxRadius);
      apply();
    },
    getRadius() {
      return spherical.radius;
    }
  };
}


