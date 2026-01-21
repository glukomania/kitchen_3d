import * as THREE from "three";

export type CameraRig = {
  camera: THREE.PerspectiveCamera;
  target: THREE.Vector3;
};

export function createCameraRig(): CameraRig {
  // Target at center of room, slightly above floor
  const target = new THREE.Vector3(0, 1, 0);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  // Position camera lower and further to see objects from a more natural angle
  camera.position.set(0, 1.2, 4);
  camera.lookAt(target);
  return { camera, target };
}


