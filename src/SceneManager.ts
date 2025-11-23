import { NeRFLoader } from './NeRFLoader.js';
import { SceneMetadata, NARRATIVE_SCENES, getSceneById, getSceneByIndex } from './scenes.js';

/**
 * SceneManager - Handles narrative scene navigation and loading
 *
 * Provides high-level API for switching between scenes in the narrative,
 * managing the current scene state, and controlling scene transitions.
 */

export class SceneManager {
  private nerfLoader: NeRFLoader;
  private currentSceneIndex: number = -1;
  private currentScene: SceneMetadata | null = null;
  private onSceneChanged?: (scene: SceneMetadata, index: number) => void;

  constructor(nerfLoader: NeRFLoader) {
    this.nerfLoader = nerfLoader;
  }

  /**
   * Loads a scene by its ID
   */
  public async loadSceneById(id: string): Promise<void> {
    const scene = getSceneById(id);
    if (!scene) {
      throw new Error(`Scene with id "${id}" not found`);
    }

    const index = NARRATIVE_SCENES.findIndex(s => s.id === id);
    await this.loadScene(scene, index);
  }

  /**
   * Loads a scene by its index
   */
  public async loadSceneByIndex(index: number): Promise<void> {
    const scene = getSceneByIndex(index);
    if (!scene) {
      throw new Error(`Scene at index ${index} not found`);
    }

    await this.loadScene(scene, index);
  }

  /**
   * Loads the next scene in the narrative sequence
   */
  public async loadNextScene(): Promise<void> {
    const nextIndex = (this.currentSceneIndex + 1) % NARRATIVE_SCENES.length;
    await this.loadSceneByIndex(nextIndex);
  }

  /**
   * Loads the previous scene in the narrative sequence
   */
  public async loadPreviousScene(): Promise<void> {
    const prevIndex =
      this.currentSceneIndex <= 0
        ? NARRATIVE_SCENES.length - 1
        : this.currentSceneIndex - 1;
    await this.loadSceneByIndex(prevIndex);
  }

  /**
   * Internal method to load a scene
   */
  private async loadScene(scene: SceneMetadata, index: number): Promise<void> {
    console.log(`\n=== Loading Scene: ${scene.title} ===`);
    console.log(`Description: ${scene.description || 'N/A'}`);
    console.log(`Location: ${scene.location.latitude.toFixed(4)}, ${scene.location.longitude.toFixed(4)}`);

    try {
      // Load the NeRF model with geolocation
      await this.nerfLoader.loadNeRFModel(scene.url, {
        location: scene.location
      });

      this.currentScene = scene;
      this.currentSceneIndex = index;

      console.log(`Scene loaded successfully [${index + 1}/${NARRATIVE_SCENES.length}]`);

      if (this.onSceneChanged) {
        this.onSceneChanged(scene, index);
      }
    } catch (error) {
      console.error(`Failed to load scene "${scene.title}":`, error);
      throw error;
    }
  }

  /**
   * Gets the currently loaded scene
   */
  public getCurrentScene(): SceneMetadata | null {
    return this.currentScene;
  }

  /**
   * Gets the current scene index
   */
  public getCurrentSceneIndex(): number {
    return this.currentSceneIndex;
  }

  /**
   * Gets all available scenes
   */
  public getAllScenes(): SceneMetadata[] {
    return [...NARRATIVE_SCENES];
  }

  /**
   * Gets the total number of scenes
   */
  public getSceneCount(): number {
    return NARRATIVE_SCENES.length;
  }

  /**
   * Gets scene information without loading it
   */
  public getSceneInfo(idOrIndex: string | number): SceneMetadata | undefined {
    if (typeof idOrIndex === 'string') {
      return getSceneById(idOrIndex);
    } else {
      return getSceneByIndex(idOrIndex);
    }
  }

  /**
   * Register a callback to be notified when a scene loads successfully
   */
  public setSceneChangedCallback(callback: (scene: SceneMetadata, index: number) => void): void {
    this.onSceneChanged = callback;
  }
}
