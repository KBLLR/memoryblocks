import { Gui } from 'uil';
import { SceneManager } from './SceneManager.js';
import { PlatformEnvironment } from './PlatformEnvironment.js';
import { NeRFLoader } from './NeRFLoader.js';

/**
 * UIManager - 3D UI controls using UIL library
 *
 * Provides interactive controls for:
 * - Scene navigation
 * - Time of day adjustment
 * - Model transformations
 */

export interface UIConfig {
  title?: string;
  width?: number;
  left?: string;
  top?: string;
}

export class UIManager {
  private gui: Gui;
  private sceneManager: SceneManager;
  private platformEnv: PlatformEnvironment;
  private nerfLoader: NeRFLoader;

  // UI state
  private state = {
    currentScene: 0,
    timeOfDay: 14,
    modelScale: 1.0,
    modelYOffset: 0,
  };

  constructor(
    sceneManager: SceneManager,
    platformEnv: PlatformEnvironment,
    nerfLoader: NeRFLoader,
    config: UIConfig = {}
  ) {
    this.sceneManager = sceneManager;
    this.platformEnv = platformEnv;
    this.nerfLoader = nerfLoader;

    const {
      title = 'MemoryBlocks',
      width = 300,
      left = '20px',
      top = '20px'
    } = config;

    // Initialize UIL GUI
    this.gui = new Gui({
      css: 'top:' + top + '; left:' + left + '; width:' + width + 'px;',
      name: title
    });

    this.setupControls();
  }

  /**
   * Sets up all UI controls
   */
  private setupControls(): void {
    this.setupSceneControls();
    this.setupEnvironmentControls();
    this.setupModelControls();
  }

  /**
   * Scene navigation controls
   */
  private setupSceneControls(): void {
    const scenes = this.sceneManager.getAllScenes();
    const sceneNames = scenes.map((s, i) => `${i}: ${s.title}`);

    this.gui.add('group', { name: 'Scene Navigation', open: true });

    // Scene selector
    this.gui.add('list', {
      name: 'Current Scene',
      list: sceneNames,
      value: sceneNames[0]
    }).onChange((value: string) => {
      const index = parseInt(value.split(':')[0]);
      this.state.currentScene = index;
      this.loadSceneAtIndex(index);
    });

    // Previous button
    this.gui.add('button', {
      name: 'Previous Scene',
      fontColor: '#88ff88'
    }).onChange(() => {
      this.previousScene();
    });

    // Next button
    this.gui.add('button', {
      name: 'Next Scene',
      fontColor: '#88ff88'
    }).onChange(() => {
      this.nextScene();
    });

    // Info display
    this.gui.add('string', {
      name: 'Info',
      value: 'Select a scene to begin',
      height: 60,
      mode: 'text'
    });
  }

  /**
   * Environment controls (time of day, lighting)
   */
  private setupEnvironmentControls(): void {
    this.gui.add('group', { name: 'Environment', open: true });

    // Time of day slider
    this.gui.add('slide', {
      name: 'Time (H)',
      min: 0,
      max: 24,
      value: this.state.timeOfDay,
      precision: 1,
      step: 0.5
    }).onChange((value: number) => {
      this.state.timeOfDay = value;
      this.platformEnv.timeOfDay = value;
    });
  }

  /**
   * Model transformation controls
   */
  private setupModelControls(): void {
    this.gui.add('group', { name: 'Model Adjustments', open: false });

    // Scale slider
    this.gui.add('slide', {
      name: 'Scale',
      min: 0.1,
      max: 5.0,
      value: this.state.modelScale,
      precision: 2,
      step: 0.1
    }).onChange((value: number) => {
      this.state.modelScale = value;
      this.nerfLoader.setScale(value);
    });

    // Vertical offset slider
    this.gui.add('slide', {
      name: 'Y Offset',
      min: -20,
      max: 20,
      value: this.state.modelYOffset,
      precision: 1,
      step: 0.5
    }).onChange((value: number) => {
      this.state.modelYOffset = value;
      const container = this.nerfLoader.getContainer();
      container.position.y += (value - this.state.modelYOffset);
    });

    // Reset button
    this.gui.add('button', {
      name: 'Reset Transforms',
      fontColor: '#ff8888'
    }).onChange(() => {
      this.resetModelTransforms();
    });
  }

  /**
   * Load scene at specific index and update UI
   */
  private async loadSceneAtIndex(index: number): Promise<void> {
    try {
      await this.sceneManager.loadSceneByIndex(index);
      this.updateSceneInfo();
    } catch (error) {
      console.error('Failed to load scene:', error);
    }
  }

  /**
   * Load next scene
   */
  private async nextScene(): Promise<void> {
    try {
      await this.sceneManager.loadNextScene();
      this.state.currentScene = this.sceneManager.getCurrentSceneIndex();
      this.updateSceneInfo();
      this.updateSceneSelector();
    } catch (error) {
      console.error('Failed to load next scene:', error);
    }
  }

  /**
   * Load previous scene
   */
  private async previousScene(): Promise<void> {
    try {
      await this.sceneManager.loadPreviousScene();
      this.state.currentScene = this.sceneManager.getCurrentSceneIndex();
      this.updateSceneInfo();
      this.updateSceneSelector();
    } catch (error) {
      console.error('Failed to load previous scene:', error);
    }
  }

  /**
   * Update scene info text
   */
  private updateSceneInfo(): void {
    const current = this.sceneManager.getCurrentScene();
    if (current) {
      const info = `${current.title}\n\n${current.description || 'No description'}`;
      this.gui.setVal('Info', info);
    }
  }

  /**
   * Update scene selector value
   */
  private updateSceneSelector(): void {
    const scenes = this.sceneManager.getAllScenes();
    const index = this.state.currentScene;
    if (index >= 0 && index < scenes.length) {
      const sceneLabel = `${index}: ${scenes[index].title}`;
      this.gui.setVal('Current Scene', sceneLabel);
    }
  }

  /**
   * Reset model transforms to default
   */
  private resetModelTransforms(): void {
    this.state.modelScale = 1.0;
    this.state.modelYOffset = 0;

    this.nerfLoader.setScale(1.0);
    this.nerfLoader.getContainer().position.y = 0;

    // Update UI sliders
    this.gui.setVal('Scale', 1.0);
    this.gui.setVal('Y Offset', 0);
  }

  /**
   * Get the GUI instance
   */
  public getGui(): Gui {
    return this.gui;
  }

  /**
   * Cleanup and dispose
   */
  public dispose(): void {
    if (this.gui) {
      this.gui.dispose();
    }
  }
}
