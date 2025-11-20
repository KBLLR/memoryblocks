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

export class NeRFLoader {
  private scene: THREE.Scene;
  private currentModel: LumaSplatsThree | null = null;
  private modelContainer: THREE.Group;
  private geoManager: GeoSpatialManager;

  constructor(scene: THREE.Scene, geoManager?: GeoSpatialManager) {
    this.scene = scene;
    this.geoManager = geoManager || new GeoSpatialManager();
    this.modelContainer = new THREE.Group();
    this.modelContainer.name = 'NeRFModelContainer';
    this.scene.add(this.modelContainer);
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

    console.log('NeRF model loading initiated');

    // Return the splat object immediately - Luma handles async loading internally
    return Promise.resolve(splat);
  }

  /**
   * Positions the model container based on geographic coordinates
   */
  private positionModelByGeo(location: GeoLocation): void {
    // If this is the first model with a location, set it as the origin
    if (!this.geoManager.getOrigin()) {
      this.geoManager.setOrigin(location);
      this.modelContainer.position.set(0, location.altitude || 0, 0);
      console.log('Set as geospatial origin:', location);
    } else {
      // Convert location to scene coordinates
      const scenePos = this.geoManager.geoToScene(location);
      this.modelContainer.position.copy(scenePos);

      const origin = this.geoManager.getOrigin();
      if (origin) {
        const distance = this.geoManager.calculateDistance(origin, location);
        console.log(
          `Model positioned at offset: ${scenePos.toArray().map((v) => v.toFixed(2))} (${distance.toFixed(0)}m from origin)`
        );
      }
    }
  }

  /**
   * Disposes of the currently loaded model
   */
  public disposeCurrentModel(): void {
    if (this.currentModel) {
      console.log('Disposing current NeRF model');

      // Remove from container
      this.modelContainer.remove(this.currentModel);

      // Dispose of the Luma splat
      // Note: LumaSplatsThree should have its own dispose method
      if (typeof (this.currentModel as any).dispose === 'function') {
        (this.currentModel as any).dispose();
      }

      this.currentModel = null;
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
  }

  /**
   * Gets the geospatial manager
   */
  public getGeoManager(): GeoSpatialManager {
    return this.geoManager;
  }

  /**
   * Cleanup all resources
   */
  public dispose(): void {
    this.disposeCurrentModel();
    this.scene.remove(this.modelContainer);
  }
}
