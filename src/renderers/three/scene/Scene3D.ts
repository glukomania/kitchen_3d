import * as THREE from "three";
import { createCameraRig } from "./createCamera";
import { createWebGLRenderer } from "./createRenderer";
import { addDefaultLights } from "./createLights";
import { createDefaultObjects } from "./createObjects";
import { createOrbitControls, type OrbitControls } from "./orbitControls";
import { applyResize } from "./resize";
import type { PlacedCabinet } from "@/features/configurator/model/types";

export class Scene3D {
  private mount: HTMLElement;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private objects: ReturnType<typeof createDefaultObjects>;
  private controls: OrbitControls;
  private ro: ResizeObserver | null = null;
  private raf = 0;
  private cabinets: Map<string, THREE.Group> = new Map();
  private cabinetMaterial: THREE.MeshStandardMaterial;
  private edgeMaterial: THREE.LineBasicMaterial;
  private handleMaterial: THREE.MeshStandardMaterial;

  constructor(mount: HTMLElement) {
    this.mount = mount;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#F8FAFC");

    const rig = createCameraRig();
    this.camera = rig.camera;

    this.renderer = createWebGLRenderer();
    this.mount.appendChild(this.renderer.domElement);

    this.objects = createDefaultObjects();
    // Cube removed - we only render cabinets now

    // Light material for cabinets (pure white) - using StandardMaterial
    this.cabinetMaterial = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(1, 1, 1), // Pure white RGB
      roughness: 0.9,
      metalness: 0.0
    });
    // Brown edges material
    this.edgeMaterial = new THREE.LineBasicMaterial({ 
      color: new THREE.Color("#92400E")
    });
    // Brown handles material - using StandardMaterial
    this.handleMaterial = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color("#92400E"),
      roughness: 0.7,
      metalness: 0.2
    });

    addDefaultLights(this.scene);

    this.controls = createOrbitControls({ camera: this.camera, target: rig.target });
    this.controls.attach(this.renderer.domElement);

    this.resize();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.mount);

    this.start();
  }

  start() {
    const tick = () => {
      this.renderer.render(this.scene, this.camera);
      this.raf = window.requestAnimationFrame(tick);
    };
    tick();
  }

  resize() {
    applyResize({
      camera: this.camera,
      renderer: this.renderer,
      cssWidth: this.mount.clientWidth,
      cssHeight: this.mount.clientHeight
    });
  }

  changeColor(hex: string) {
    this.objects.material.color.set(hex);
    // Apply selected color to all cabinets (they all share the same material)
    this.cabinetMaterial.color.set(hex);
    // Edges and handles stay brown
  }

  updateCabinets(cabinets: PlacedCabinet[], viewportWidth: number, viewportHeight: number) {
    // Remove cabinets that are no longer in the list
    const currentIds = new Set(cabinets.map((c) => c.id));
    for (const [id, group] of this.cabinets.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(group);
        // Dispose geometries and materials
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
          }
          if (child instanceof THREE.LineSegments) {
            child.geometry.dispose();
          }
        });
        this.cabinets.delete(id);
      }
    }

    // Update or create cabinets
    for (const cabinet of cabinets) {
      const existingGroup = this.cabinets.get(cabinet.id);

      // Get 3D dimensions based on cabinet type and size
      const width = cabinet.size === "60" ? 0.6 : 0.4;
      const height = cabinet.type === "bottom" ? 0.8 : 0.7;
      const depth = cabinet.type === "bottom" ? 0.5 : 0.3;

      // Convert 2D coordinates to 3D
      // Room in 2D is 500x300px, centered in viewport
      // Map to 5x3 units in 3D space (scale: 1 pixel = 0.01 units)
      const scale = 0.01;
      // Room center in viewport (room is centered)
      const roomCenterX = viewportWidth / 2;
      const roomCenterY = viewportHeight / 2;
      // Convert cabinet position: cabinet.x/y are top-left corner coordinates in viewport
      // In 2D, coordinates represent top-left corner, but in 3D we position by center
      // Need to account for rotation when calculating center offset
      const rotationRad = THREE.MathUtils.degToRad(cabinet.rotation);
      const cosRot = Math.cos(rotationRad);
      const sinRot = Math.sin(rotationRad);
      // Calculate offset from top-left corner to center based on rotation
      // When rotated, width and depth swap for offset calculation
      const offsetX = (width * cosRot - depth * sinRot) / 2;
      const offsetZ = (width * sinRot + depth * cosRot) / 2;
      const x3d = (cabinet.x - roomCenterX) * scale + offsetX;
      const z3d = (cabinet.y - roomCenterY) * scale + offsetZ;
      // Bottom cabinets: y=0 means bottom at y=0, so center at height/2
      // Top cabinets: y=1.5 means bottom at y=1.5, so center at 1.5 + height/2
      const y3d = cabinet.type === "bottom" ? height / 2 : 1.5 + height / 2;

      if (existingGroup) {
        // Update existing cabinet position and rotation
        existingGroup.position.set(x3d, y3d, z3d);
        existingGroup.rotation.y = rotationRad;
        // Check if dimensions changed - if so, recreate
        const mesh = existingGroup.children.find((c) => c instanceof THREE.Mesh) as THREE.Mesh | undefined;
        if (mesh) {
          const geo = mesh.geometry as THREE.BoxGeometry;
          const params = geo.parameters;
          if (params.width !== width || params.height !== height || params.depth !== depth) {
            // Recreate cabinet with new dimensions
            this.scene.remove(existingGroup);
            existingGroup.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.geometry.dispose();
              }
              if (child instanceof THREE.LineSegments) {
                child.geometry.dispose();
              }
            });
            const newGroup = this.createCabinetGroup(width, height, depth);
            newGroup.position.set(x3d, y3d, z3d);
            newGroup.rotation.y = rotationRad;
            this.scene.add(newGroup);
            this.cabinets.set(cabinet.id, newGroup);
          }
        }
      } else {
        // Create new cabinet with mesh, edges, and handles
        const group = this.createCabinetGroup(width, height, depth);
        group.position.set(x3d, y3d, z3d);
        group.rotation.y = rotationRad;
        this.scene.add(group);
        this.cabinets.set(cabinet.id, group);
      }
    }
  }

  private createCabinetGroup(width: number, height: number, depth: number): THREE.Group {
    const group = new THREE.Group();

    // Main cabinet mesh - light color
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geometry, this.cabinetMaterial);
    group.add(mesh);

    // Edges outline - brown color
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edges = new THREE.LineSegments(edgesGeometry, this.edgeMaterial);
    edges.renderOrder = 1; // Render edges after mesh
    group.add(edges);

    // Single long handle on the front face
    const handleSize = 0.03; // Handle thickness
    const handleLength = width * 0.7; // Long handle spanning 70% of cabinet width
    const handleY = height * 0.4; // Position handle at 40% of height
    const handleZ = depth / 2 + 0.01; // Slightly in front of the cabinet

    // Single long handle (horizontal bar)
    const handleGeometry = new THREE.BoxGeometry(handleLength, handleSize, handleSize);
    const handle = new THREE.Mesh(handleGeometry, this.handleMaterial);
    handle.position.set(0, handleY, handleZ); // Centered horizontally
    group.add(handle);

    return group;
  }

  // Placeholder for future API.
  changeTexture(_textureUrl: string | null) {
    void _textureUrl;
    // Intentionally empty: textures are project-specific.
  }

  dispose() {
    window.cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.ro = null;
    this.controls.detach();

    // Dispose cabinets
    for (const group of this.cabinets.values()) {
      this.scene.remove(group);
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
        }
        if (child instanceof THREE.LineSegments) {
          child.geometry.dispose();
        }
      });
    }
    this.cabinets.clear();
    this.cabinetMaterial.dispose();
    this.edgeMaterial.dispose();
    this.handleMaterial.dispose();

    this.objects.geometry.dispose();
    this.objects.material.dispose();

    this.renderer.dispose();
    this.mount.removeChild(this.renderer.domElement);
  }
}


