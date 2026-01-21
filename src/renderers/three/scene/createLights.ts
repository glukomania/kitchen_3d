import * as THREE from "three";

export function addDefaultLights(scene: THREE.Scene) {
  // Main directional light - neutral white, brighter
  const light1 = new THREE.DirectionalLight(0xffffff, 2.5);
  light1.position.set(2, 3, 2);
  scene.add(light1);

  // Ambient light - neutral white, brighter for better visibility
  const light2 = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(light2);

  // Additional fill light from opposite side - neutral white
  const light3 = new THREE.DirectionalLight(0xffffff, 1.0);
  light3.position.set(-2, 2, -2);
  scene.add(light3);

  return { light1, light2, light3 };
}



