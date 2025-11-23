import * as THREE from 'three';
import { LumaSplatsThree } from '@lumaai/luma-web';
import { GeoSpatialManager, GeoLocation } from './GeoSpatial.js';

/**
 * NeRFLoader - Dynamic NeRF model loading and management
 *
 * This module handles loading and displaying Gaussian Splatting NeRF models
 * from Luma Labs captures. Supports dynamic loading by URL and proper cleanup.
 * Now includes geospatial positioning support.
 */

export interface NeRFModelOptions {
  enableThreeShaderIntegration?: boolean;
  loadingAnimationEnabled?: boolean;
  particleRevealEnabled?: boolean;
  location?: GeoLocation;
}

export interface PlatformConstraints {
  size: number;
  height: number;
  surfaceY: number;
  clipHeight?: number;
}

export class NeRFLoader {
  private scene: THREE.Scene;
  private currentModel: LumaSplatsThree | null = null;
  private modelContainer: THREE.Group;
  private geoManager: GeoSpatialManager;
  private platformConstraints: PlatformConstraints;
  private clipPlanes: THREE.Plane[];
  private clipHelper?: THREE.Box3Helper;
  private clipUniforms?: {
    min: THREE.Vector3;
    max: THREE.Vector3;
    minUniform: { value: THREE.Vector3 };
    maxUniform: { value: THREE.Vector3 };
  };
  private sliceEnabled: boolean = false;
  private slicePlanes = {
    xNeg: 0,
    xPos: 0,
    yNeg: 0,
    yPos: 0,
    zNeg: 0,
    zPos: 0,
  };
  private sliceUniforms?: Array<{ value: THREE.Vector4 }>;
  private sliceHelperGroup?: THREE.Group;
  private clippingEnabled: boolean;

  constructor(
    scene: THREE.Scene,
    platformConstraints?: PlatformConstraints,
    geoManager?: GeoSpatialManager,
    options?: {
      enableClipping?: boolean;
    }
  ) {
    this.scene = scene;
    this.geoManager = geoManager || new GeoSpatialManager();
    this.platformConstraints = platformConstraints || {
      size: 60,
      height: 1.5,
      surfaceY: 0
    };

    this.clippingEnabled = options?.enableClipping ?? true;

    // Create clipping planes for platform boundaries
    this.clipPlanes = this.createClippingPlanes();

    this.modelContainer = new THREE.Group();
    this.modelContainer.name = 'NeRFModelContainer';
    this.scene.add(this.modelContainer);
  }

  /**
   * Creates clipping planes for platform boundaries
   */
  private createClippingPlanes(): THREE.Plane[] {
    const halfSize = this.platformConstraints.size / 2;
    const clipHeight =
      this.platformConstraints.clipHeight ??
      this.platformConstraints.height ??
      this.platformConstraints.size;
    const floorY = this.platformConstraints.surfaceY;

    const makePlane = (normal: THREE.Vector3, point: THREE.Vector3): THREE.Plane => {
      const plane = new THREE.Plane();
      plane.setFromNormalAndCoplanarPoint(normal, point);
      return plane;
    };

    return [
      makePlane(new THREE.Vector3(1, 0, 0), new THREE.Vector3(halfSize, floorY, 0)),   // +X wall
      makePlane(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(-halfSize, floorY, 0)), // -X wall
      makePlane(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, floorY, halfSize)),   // +Z wall
      makePlane(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, floorY, -halfSize)), // -Z wall
      makePlane(new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, floorY, 0)),         // Floor (keep above)
      makePlane(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, floorY + clipHeight, 0)) // Ceiling
    ];
  }

  /**
   * Loads a NeRF model from a Luma capture URL
   * @param url - Luma capture URL (e.g., "https://lumalabs.ai/capture/...")
   * @param options - Loading options including optional geolocation
   * @returns Promise that resolves when the model is loaded
   */
  public async loadNeRFModel(
    url: string,
    options: NeRFModelOptions = {}
  ): Promise<LumaSplatsThree> {
    // Dispose of any existing model first
    this.disposeCurrentModel();

    const {
      enableThreeShaderIntegration = true,
      loadingAnimationEnabled = true,
      particleRevealEnabled = true,
      location
    } = options;

    console.log(`Loading NeRF model from: ${url}`);

    // Create new Luma Splats instance
    const splat = new LumaSplatsThree({
      source: url,
      enableThreeShaderIntegration,
      loadingAnimationEnabled,
      particleRevealEnabled
    });

    // Add to the container
    this.modelContainer.add(splat);
    this.currentModel = splat;

    // If geolocation is provided, position the model accordingly
    if (location) {
      this.positionModelByGeo(location);
    }

    // Wait for model to load and then auto-scale if needed
    this.waitForModelAndAutoScale(splat);

    // Apply shader-based clipping/slicing
    this.updateShaderHooks(splat);

    console.log('NeRF model loading initiated');

    // Return the splat object immediately - Luma handles async loading internally
    return Promise.resolve(splat);
  }

  /**
   * Waits for the model to load and automatically scales it to fit the platform if needed
   */
  private async waitForModelAndAutoScale(splat: LumaSplatsThree): Promise<void> {
    // Wait for the model to have geometry by polling
    const maxAttempts = 100; // ~10 seconds max wait
    let attempts = 0;

    const checkLoaded = async (): Promise<boolean> => {
      // Check if the splat has children with geometry
      let hasGeometry = false;
      splat.traverse((child) => {
        if (child instanceof THREE.Mesh || (child as any).geometry) {
          hasGeometry = true;
        }
      });
      return hasGeometry;
    };

    // Poll until loaded or timeout
    while (attempts < maxAttempts) {
      const loaded = await checkLoaded();
      if (loaded) {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.warn('Model loading timeout - skipping auto-scale');
      return;
    }

    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(splat);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Check if model exceeds platform bounds (with some margin)
    const platformSize = this.platformConstraints.size;
    const maxDimension = Math.max(size.x, size.z); // Only check horizontal dimensions
    const margin = 0.9; // Use 90% of platform size to leave some space

    if (maxDimension > platformSize * margin) {
      const scaleFactor = (platformSize * margin) / maxDimension;
      this.modelContainer.scale.multiplyScalar(scaleFactor);

      console.log(`Model auto-scaled by ${scaleFactor.toFixed(3)}x to fit platform`);
      console.log(`Original size: [${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)}]`);
      console.log(`Platform size: ${platformSize.toFixed(2)}`);
    } else {
      console.log(`Model fits within platform bounds`);
      console.log(`Model size: [${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)}]`);
      console.log(`Platform size: ${platformSize.toFixed(2)}`);
    }

    // Re-apply clipping planes after scaling
    if (this.clippingEnabled) {
      this.applyClippingPlanes();
      this.refreshClipUniforms();
    }
    // Update shader slicing/clipping after scale
    this.updateShaderHooks();
  }

  /**
   * Positions the model container based on geographic coordinates
   * Ensures model sits on platform surface (Y=0)
   */
  private positionModelByGeo(location: GeoLocation): void {
    // If this is the first model with a location, set it as the origin
    if (!this.geoManager.getOrigin()) {
      this.geoManager.setOrigin(location);
      // Position at origin, sitting on platform surface
      this.modelContainer.position.set(0, this.platformConstraints.surfaceY, 0);
      console.log('Set as geospatial origin:', location);
      console.log('Model positioned at platform surface (Y=0)');
    } else {
      // Convert location to scene coordinates
      const scenePos = this.geoManager.geoToScene(location);

      // Override Y position to sit on platform surface
      scenePos.y = this.platformConstraints.surfaceY;

      this.modelContainer.position.copy(scenePos);

      const origin = this.geoManager.getOrigin();
      if (origin) {
        const distance = this.geoManager.calculateDistance(origin, location);
        console.log(
          `Model positioned at offset: [${scenePos.x.toFixed(2)}, ${scenePos.y.toFixed(2)}, ${scenePos.z.toFixed(2)}] (${distance.toFixed(0)}m from origin)`
        );
      }
    }

    // Apply clipping planes to the model
    this.applyClippingPlanes();
  }

  /**
   * Applies clipping planes to the current model's materials
   */
  private applyClippingPlanes(): void {
    if (!this.currentModel || !this.clippingEnabled) return;

    // Apply clipping planes to model materials (Meshes and Points)
    this.currentModel.traverse((child: THREE.Object3D) => {
      const hasMaterial =
        (child instanceof THREE.Mesh || child instanceof THREE.Points) &&
        (child as THREE.Mesh | THREE.Points).material;

      if (hasMaterial) {
        const materials = Array.isArray((child as any).material)
          ? (child as any).material
          : [(child as any).material];

        materials.forEach((mat: THREE.Material) => {
          mat.clippingPlanes = this.clipPlanes;
          mat.clipIntersection = true; // Keep fragments inside all planes
          mat.needsUpdate = true;
        });
      }
    });
  }

  /**
   * Apply shader hooks for clipping/slicing
   */
  private updateShaderHooks(splat?: LumaSplatsThree): void {
    const target = splat || this.currentModel;
    if (!target) return;

    const additionalUniforms: Record<string, any> = {};
    let body = `
      vec4 color = splatColor;
    `;

    if (this.clippingEnabled) {
      if (!this.clipUniforms) {
        this.clipUniforms = {
          min: new THREE.Vector3(),
          max: new THREE.Vector3(),
          minUniform: { value: new THREE.Vector3() },
          maxUniform: { value: new THREE.Vector3() },
        };
        this.refreshClipUniforms();
      }

      additionalUniforms['uClipMin'] = ['vec3', this.clipUniforms.minUniform];
      additionalUniforms['uClipMax'] = ['vec3', this.clipUniforms.maxUniform];

      body += `
        if (splatPosition.x < uClipMin.x || splatPosition.x > uClipMax.x ||
            splatPosition.y < uClipMin.y || splatPosition.y > uClipMax.y ||
            splatPosition.z < uClipMin.z || splatPosition.z > uClipMax.z) {
          return vec4(0.0);
        }
      `;
    }

    if (this.sliceEnabled) {
      this.ensureSliceUniforms();
      const activePlanes = this.updateSliceUniforms();

      // Always declare all 6 uniforms to satisfy shader references
      if (this.sliceUniforms) {
        for (let i = 0; i < this.sliceUniforms.length; i++) {
          additionalUniforms[`uSlicePlane${i}`] = ['vec4', this.sliceUniforms[i]];
        }
      }
      additionalUniforms['uSliceCount'] = ['int', { value: activePlanes }];

      body += `
        for (int i = 0; i < uSliceCount; i++) {
          vec4 plane;
          if (i == 0) plane = uSlicePlane0;
          else if (i == 1) plane = uSlicePlane1;
          else if (i == 2) plane = uSlicePlane2;
          else if (i == 3) plane = uSlicePlane3;
          else if (i == 4) plane = uSlicePlane4;
          else plane = uSlicePlane5;
          float side = dot(plane, vec4(splatPosition, 1.0));
          if (side > 0.0) return vec4(0.0);
        }
      `;
    }

    body += `
      return color;
    `;

    target.setShaderHooks({
      vertexShaderHooks: {
        additionalUniforms,
        getSplatColor: `(vec4 splatColor, vec3 splatPosition, uint layersBitmask) { ${body} }`,
      },
    });
  }

  /**
   * Update clip uniforms (and helper box) when scale/height changes
   */
  private refreshClipUniforms(): void {
    if (!this.clipUniforms || !this.clippingEnabled) return;

    const halfSize = (this.platformConstraints.size / 2) * this.modelContainer.scale.x;
    const clipHeight =
      (this.platformConstraints.clipHeight ??
        this.platformConstraints.height ??
        this.platformConstraints.size) * this.modelContainer.scale.y;
    const floorY = this.platformConstraints.surfaceY * this.modelContainer.scale.y;

    this.clipUniforms.min.set(-halfSize, floorY, -halfSize);
    this.clipUniforms.max.set(halfSize, floorY + clipHeight, halfSize);
    this.clipUniforms.minUniform.value.copy(this.clipUniforms.min);
    this.clipUniforms.maxUniform.value.copy(this.clipUniforms.max);

    if (this.clipHelper) {
      const box = this.clipHelper.box;
      box.min.copy(this.clipUniforms.min);
      box.max.copy(this.clipUniforms.max);
      this.clipHelper.updateMatrixWorld(true);
    }
  }

  /**
   * Ensure slice uniforms array exists
   */
  private ensureSliceUniforms(): void {
    if (!this.sliceUniforms) {
      this.sliceUniforms = [];
      for (let i = 0; i < 6; i++) {
        this.sliceUniforms.push({ value: new THREE.Vector4(0, 1, 0, 0) });
      }
    }
  }

  /**
   * Update slice plane uniforms (planes in model space)
   * Planes defined as normals pointing inward; positive dot -> discard
   */
  private updateSliceUniforms(): number {
    if (!this.sliceUniforms) return 0;

    const s = this.modelContainer.scale;
    const planes: Array<THREE.Vector4> = [];

    const addPlane = (normal: THREE.Vector3, distance: number) => {
      // plane: n.x * x + n.y * y + n.z * z + d = 0
      planes.push(new THREE.Vector4(normal.x, normal.y, normal.z, distance));
    };

    if (this.slicePlanes.xPos !== 0) {
      const d = -(this.slicePlanes.xPos / Math.max(s.x, 1e-6));
      addPlane(new THREE.Vector3(1, 0, 0), d);
    }
    if (this.slicePlanes.xNeg !== 0) {
      const d = this.slicePlanes.xNeg / Math.max(s.x, 1e-6);
      addPlane(new THREE.Vector3(-1, 0, 0), d);
    }
    if (this.slicePlanes.yPos !== 0) {
      const d = -(this.slicePlanes.yPos / Math.max(s.y, 1e-6));
      addPlane(new THREE.Vector3(1, 0, 0).set(0, 1, 0), d);
    }
    if (this.slicePlanes.yNeg !== 0) {
      const d = -this.slicePlanes.yNeg / Math.max(s.y, 1e-6);
      addPlane(new THREE.Vector3(0, -1, 0), d);
    }
    if (this.slicePlanes.zPos !== 0) {
      const d = -(this.slicePlanes.zPos / Math.max(s.z, 1e-6));
      addPlane(new THREE.Vector3(0, 0, 1), d);
    }
    if (this.slicePlanes.zNeg !== 0) {
      const d = -this.slicePlanes.zNeg / Math.max(s.z, 1e-6);
      addPlane(new THREE.Vector3(0, 0, -1), d);
    }

    // Write into uniforms (pad remaining with zero planes)
    for (let i = 0; i < this.sliceUniforms.length; i++) {
      const plane = planes[i] || new THREE.Vector4(0, 0, 0, 0);
      this.sliceUniforms[i].value.copy(plane);
    }

    // Update debug helpers
    this.updateSliceHelpers(planes);
    return planes.length;
  }

  /**
   * Create/update line helpers for slice planes to visualize cuts
   */
  private updateSliceHelpers(planes: Array<THREE.Vector4>): void {
    if (!this.sliceEnabled) {
      this.removeSliceHelpers();
      return;
    }

    // Bounds: use clip bounds if available, else platform size/height
    const bounds = this.getClipBounds();
    if (!bounds) return;

    if (!this.sliceHelperGroup) {
      this.sliceHelperGroup = new THREE.Group();
      this.sliceHelperGroup.name = 'SliceHelpers';
      this.modelContainer.add(this.sliceHelperGroup);
    }

    const helper = this.sliceHelperGroup;

    // Clear existing helpers
    while (helper.children.length) {
      const child = helper.children.pop() as THREE.LineSegments;
      child.geometry.dispose();
      (child.material as THREE.Material).dispose();
    }

    const color = 0xff00ff;

    planes.forEach((plane) => {
      const n = new THREE.Vector3(plane.x, plane.y, plane.z);
      const d = plane.w;

      // Only handle axis-aligned planes
      if (n.x !== 0) {
        const x = -d / n.x;
        if (x < bounds.min.x || x > bounds.max.x) return;
        const y0 = bounds.min.y;
        const y1 = bounds.max.y;
        const z0 = bounds.min.z;
        const z1 = bounds.max.z;
        const verts = [
          x, y0, z0, x, y1, z0,
          x, y1, z0, x, y1, z1,
          x, y1, z1, x, y0, z1,
          x, y0, z1, x, y0, z0,
        ];
        helper.add(this.makeLineHelper(verts, color));
      } else if (n.y !== 0) {
        const y = -d / n.y;
        if (y < bounds.min.y || y > bounds.max.y) return;
        const x0 = bounds.min.x;
        const x1 = bounds.max.x;
        const z0 = bounds.min.z;
        const z1 = bounds.max.z;
        const verts = [
          x0, y, z0, x1, y, z0,
          x1, y, z0, x1, y, z1,
          x1, y, z1, x0, y, z1,
          x0, y, z1, x0, y, z0,
        ];
        helper.add(this.makeLineHelper(verts, color));
      } else if (n.z !== 0) {
        const z = -d / n.z;
        if (z < bounds.min.z || z > bounds.max.z) return;
        const x0 = bounds.min.x;
        const x1 = bounds.max.x;
        const y0 = bounds.min.y;
        const y1 = bounds.max.y;
        const verts = [
          x0, y0, z, x1, y0, z,
          x1, y0, z, x1, y1, z,
          x1, y1, z, x0, y1, z,
          x0, y1, z, x0, y0, z,
        ];
        helper.add(this.makeLineHelper(verts, color));
      }
    });
  }

  private makeLineHelper(verts: number[], color: number): THREE.LineSegments {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 });
    return new THREE.LineSegments(geom, mat);
  }

  /**
   * Get current clip bounds in model space
   */
  private getClipBounds(): { min: THREE.Vector3; max: THREE.Vector3 } | null {
    if (this.clipUniforms) {
      return { min: this.clipUniforms.min.clone(), max: this.clipUniforms.max.clone() };
    }

    const halfSize = (this.platformConstraints.size / 2) * this.modelContainer.scale.x;
    const clipHeight =
      (this.platformConstraints.clipHeight ??
        this.platformConstraints.height ??
        this.platformConstraints.size) * this.modelContainer.scale.y;
    const floorY = this.platformConstraints.surfaceY * this.modelContainer.scale.y;

    const min = new THREE.Vector3(-halfSize, floorY, -halfSize);
    const max = new THREE.Vector3(halfSize, floorY + clipHeight, halfSize);
    return { min, max };
  }

  private removeSliceHelpers(): void {
    if (this.sliceHelperGroup) {
      this.sliceHelperGroup.children.forEach((child) => {
        const line = child as THREE.LineSegments;
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      this.sliceHelperGroup.clear();
      this.modelContainer.remove(this.sliceHelperGroup);
      this.sliceHelperGroup = undefined;
    }
  }

  /**
   * Toggle a wireframe helper that visualizes the clipping cube
   * Helpful for debugging diorama bounds and positioning models
   */
  public setClipHelperVisible(visible: boolean, color = 0x00ffff): void {
    if (!this.clippingEnabled) return;

    if (!this.clipHelper) {
      const halfSize = this.platformConstraints.size / 2;
      const clipHeight =
        this.platformConstraints.clipHeight ??
        this.platformConstraints.height ??
        this.platformConstraints.size;
      const floorY = this.platformConstraints.surfaceY;

      const min = new THREE.Vector3(-halfSize, floorY, -halfSize);
      const max = new THREE.Vector3(halfSize, floorY + clipHeight, halfSize);
      const box = new THREE.Box3(min, max);

      this.clipHelper = new THREE.Box3Helper(box, color);
      this.clipHelper.name = 'ClipBoxHelper';
      // Parent to model container so it follows position/scale/rotation
      this.modelContainer.add(this.clipHelper);
    }

    // Ensure helper matches latest clip uniforms
    this.refreshClipUniforms();
    this.clipHelper.visible = visible;
  }

  /**
   * Enable or disable all clipping (planes + shader mask)
   */
  public setClippingEnabled(enabled: boolean): void {
    this.clippingEnabled = enabled;

    if (!enabled) {
      // Remove planes and helper, reset shader hooks
      this.removeClipHelper();
      this.removeSliceHelpers();
      if (this.currentModel) {
        this.currentModel.setShaderHooks({});
        this.clearClippingFromMaterials();
      }
    } else {
      if (this.currentModel) {
        this.applyClippingPlanes();
        this.refreshClipUniforms();
      }
    }
    this.updateShaderHooks();
  }

  /**
   * Remove helper safely
   */
  private removeClipHelper(): void {
    if (this.clipHelper) {
      this.clipHelper.geometry.dispose();
      (this.clipHelper.material as THREE.Material).dispose();
      this.modelContainer.remove(this.clipHelper);
      this.clipHelper = undefined;
    }
  }

  /**
   * Enable/disable and position a horizontal slice plane in model space
   * Positive values hide splats on the positive side of each axis
   */
  public setSlicePlane(enabled: boolean, sliceHeight?: number): void {
    this.sliceEnabled = enabled;
    if (sliceHeight !== undefined) {
      this.slicePlanes.yPos = sliceHeight;
    }
    this.updateSliceUniforms();
    this.updateShaderHooks();
    if (!enabled) {
      this.removeSliceHelpers();
    }
  }

  /**
   * Set per-side slice distances (model space). Zero disables a side.
   */
  public setSlicePlanes(values: Partial<typeof this.slicePlanes>): void {
    this.sliceEnabled = true;
    this.slicePlanes = { ...this.slicePlanes, ...values };
    this.updateSliceUniforms();
    this.updateShaderHooks();
  }

  /**
   * Clear clipping planes from materials
   */
  private clearClippingFromMaterials(): void {
    if (!this.currentModel) return;

    this.currentModel.traverse((child: THREE.Object3D) => {
      const hasMaterial =
        (child instanceof THREE.Mesh || child instanceof THREE.Points) &&
        (child as THREE.Mesh | THREE.Points).material;

      if (hasMaterial) {
        const materials = Array.isArray((child as any).material)
          ? (child as any).material
          : [(child as any).material];

        materials.forEach((mat: THREE.Material) => {
          mat.clippingPlanes = null;
          mat.needsUpdate = true;
        });
      }
    });
  }

  /**
   * Disposes of the currently loaded model
   * Ensures comprehensive cleanup of GPU resources to prevent memory leaks
   */
  public disposeCurrentModel(): void {
    if (this.currentModel) {
      console.log('Disposing current NeRF model...');

      // Traverse and dispose of all materials, geometries, and textures
      this.currentModel.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          // Dispose geometry
          if (child.geometry) {
            child.geometry.dispose();
          }

          // Dispose materials
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((material: THREE.Material) => {
              // Dispose textures
              Object.keys(material).forEach((key) => {
                const value = (material as any)[key];
                if (value && value instanceof THREE.Texture) {
                  value.dispose();
                }
              });

              // Dispose material
              material.dispose();
            });
          }
        }
      });

      // Remove from container
      this.modelContainer.remove(this.currentModel);

      // Dispose of the Luma splat using its own dispose method if available
      if (typeof (this.currentModel as any).dispose === 'function') {
        (this.currentModel as any).dispose();
      }

      this.currentModel = null;
      console.log('NeRF model disposed successfully');
    }
  }

  /**
   * Gets the current model instance
   */
  public getCurrentModel(): LumaSplatsThree | null {
    return this.currentModel;
  }

  /**
   * Gets the model container group
   */
  public getContainer(): THREE.Group {
    return this.modelContainer;
  }

  /**
   * Sets the position of the model container
   */
  public setPosition(x: number, y: number, z: number): void {
    this.modelContainer.position.set(x, y, z);
    if (this.clippingEnabled) {
      this.refreshClipUniforms();
    }
    this.updateShaderHooks();
  }

  /**
   * Sets the rotation of the model container
   */
  public setRotation(x: number, y: number, z: number): void {
    this.modelContainer.rotation.set(x, y, z);
  }

  /**
   * Sets the scale of the model container
   */
  public setScale(scale: number): void {
    this.modelContainer.scale.setScalar(scale);
    if (this.clippingEnabled) {
      this.refreshClipUniforms();
    }
  }

  /**
   * Gets the geospatial manager
   */
  public getGeoManager(): GeoSpatialManager {
    return this.geoManager;
  }

  /**
   * Cleanup all resources
   * Call this when shutting down or resetting the entire scene
   */
  public dispose(): void {
    console.log('NeRFLoader: Starting full cleanup...');

    // Dispose current model
    this.disposeCurrentModel();

    // Remove container from scene
    this.scene.remove(this.modelContainer);

    // Dispose clip helper
    this.removeClipHelper();
    this.clipUniforms = undefined;
    this.removeSliceHelpers();

    // Clear clipping planes array
    this.clipPlanes.length = 0;

    // Reset geospatial manager
    this.geoManager.reset();

    console.log('NeRFLoader: Cleanup complete');
  }
}
