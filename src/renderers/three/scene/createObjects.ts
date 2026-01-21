import * as THREE from "three";

export type SceneObjects = {
  cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;
  geometry: THREE.BoxGeometry;
  material: THREE.MeshStandardMaterial;
};

export function createDefaultObjects(): SceneObjects {
  const geometry = new THREE.BoxGeometry(0.8, 0.6, 0.8);
  const material = new THREE.MeshStandardMaterial({ color: new THREE.Color("#111827") });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(0, 0.35, 0);

  return { cube, geometry, material };
}


