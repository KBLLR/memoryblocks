import * as THREE from 'three';
import { LumaSplatsThree } from '@lumaai/luma-web';

/**
 * NeRFLoader - Dynamic NeRF model loading and management
 *
 * This module handles loading and displaying Gaussian Splatting NeRF models
 * from Luma Labs captures. Supports dynamic loading by URL and proper cleanup.
 */

export interface NeRFModelOptions {
  enableThreeShaderIntegration?: boolean;
  loadingAnimationEnabled?: boolean;
  particleRevealEnabled?: boolean;
}

export class NeRFLoader {
  private scene: THREE.Scene;
  private currentModel: LumaSplatsThree | null = null;
  private modelContainer: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.modelContainer = new THREE.Group();
    this.modelContainer.name = 'NeRFModelContainer';
    this.scene.add(this.modelContainer);
  }

  /**
   * Loads a NeRF model from a Luma capture URL
   * @param url - Luma capture URL (e.g., "https://lumalabs.ai/capture/...")
   * @param options - Loading options
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
      particleRevealEnabled = true
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

    // Return promise that resolves when loaded
    // The Luma splat loads asynchronously, we'll just return it immediately
    // and let the renderer handle the progressive loading
    console.log('NeRF model loading initiated');

    // Return the splat object immediately - Luma handles async loading internally
    return Promise.resolve(splat);
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
   * Cleanup all resources
   */
  public dispose(): void {
    this.disposeCurrentModel();
    this.scene.remove(this.modelContainer);
  }
}
