import { Gui, type GuiControl } from 'uil';
import * as THREE from 'three';
import { SceneManager } from './SceneManager.js';
import { PlatformEnvironment } from './PlatformEnvironment.js';
import { NeRFLoader } from './NeRFLoader.js';

/**
 * UIManager - Enhanced Responsive UI Controls
 *
 * Provides comprehensive interactive controls for:
 * - Scene navigation with NeRF URL management
 * - Camera & view controls
 * - Geospatial positioning
 * - NeRF/Luma quality & rendering settings
 * - Environment (time of day, lighting)
 * - Model transformations
 *
 * Features:
 * - Responsive sizing based on viewport
 * - Touch-friendly controls (min 48px hit targets)
 * - Multi-row organized layout
 * - Memory-safe with proper cleanup
 * - Viewport adaptation
 */

export interface UIConfig {
  title?: string;
  width?: number;
  left?: string;
  right?: string;
  top?: string;
  anchor?: 'left' | 'right';
  camera?: THREE.Camera;
  renderer?: THREE.WebGLRenderer;
  fogControls?: {
    enabled: boolean;
    density: number;
    color: string;
    setEnabled: (enabled: boolean) => void;
    setDensity: (density: number) => void;
    setColor: (color: string) => void;
  };
}

export class UIManager {
  private gui: Gui;
  private sceneManager: SceneManager;
  private platformEnv: PlatformEnvironment;
  private nerfLoader: NeRFLoader;
  private camera?: THREE.Camera;
  private renderer?: THREE.WebGLRenderer;
  private fogControls?: UIConfig['fogControls'];

  // Control references for cleanup
  private controlRefs: any[] = [];
  private resizeHandler?: () => void;

  // Control references for programmatic updates
  private controls: {
    sceneSelector?: GuiControl;
    infoDisplay?: GuiControl;
    scaleSlider?: GuiControl;
    yOffsetSlider?: GuiControl;
    rotationY?: GuiControl;
    currentUrl?: GuiControl;
    locationInfo?: GuiControl;
    fovControl?: GuiControl;
    rendererInfo?: GuiControl;
    sliceToggle?: GuiControl;
  } = {};

  // UI state
  private state = {
    currentScene: 0,
    timeOfDay: 14,
    modelScale: 1.0,
    modelYOffset: 0,
    modelRotationY: 0,
    cameraFOV: 75,
    cameraDistance: 50,
    nerfURL: '',
    loadingAnimation: true,
    particleReveal: true,
    enableShaderIntegration: true,
    semanticMaskForeground: true,
    semanticMaskBackground: true,
    fogEnabled: false,
    fogDensity: 0.15,
    sliceEnabled: false,
    sliceXNeg: 0,
    sliceXPos: 0,
    sliceYNeg: 0,
    sliceYPos: 0,
    sliceZNeg: 0,
    sliceZPos: 0,
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
    this.camera = config.camera;
    this.renderer = config.renderer;
    this.fogControls = config.fogControls;

    const {
      title = 'MemoryBlocks',
      width = this.calculateResponsiveWidth(),
      left = '20px',
      right = '20px',
      top = '50%',
      anchor = 'right'
    } = config;

    const positionCss =
      anchor === 'right'
        ? `top:${top}; right:${right}; transform: translateY(-50%);`
        : `top:${top}; left:${left};`;

    // Initialize UIL GUI with responsive width
    this.gui = new Gui({
      css: `${positionCss} width:${width}px;`,
      name: title
    });

    this.setupControls();
    this.setupResponsiveness();
  }

  /**
   * Calculate responsive width based on viewport
   * Ensures touch-friendly sizing on mobile devices
   */
  private calculateResponsiveWidth(): number {
    const vw = window.innerWidth;
    if (vw < 480) return Math.min(vw - 40, 320); // Mobile: leave 20px margin on each side
    if (vw < 768) return 340; // Tablet
    return 360; // Desktop
  }

  /**
   * Sets up viewport responsiveness
   */
  private setupResponsiveness(): void {
    this.resizeHandler = () => {
      // Could rebuild GUI with new width if needed
      // For now, UIL handles basic responsiveness
    };
    window.addEventListener('resize', this.resizeHandler);
  }

  /**
   * Sets up all UI controls in organized multi-row layout
   */
  private setupControls(): void {
    // Row 1: Scene Navigation (always visible)
    this.setupSceneControls();

    // Row 2: Camera & View Controls
    this.setupCameraControls();

    // Row 3: NeRF/Luma Settings
    this.setupNeRFControls();

    // Row 4: Geospatial Positioning
    this.setupGeospatialControls();

    // Row 5: Environment & Lighting
    this.setupEnvironmentControls();

    // Row 6: Model Transformations
    this.setupModelControls();
  }

  /**
   * Scene navigation controls
   */
  private setupSceneControls(): void {
    const scenes = this.sceneManager.getAllScenes();
    const sceneNames = scenes.map((s, i) => `${i}: ${s.title}`);

    console.log(`\n=== Scene List Initialized ===`);
    console.log(`Total scenes available: ${scenes.length}`);
    scenes.forEach((scene, i) => {
      console.log(`  [${i}] ${scene.id}: ${scene.title}`);
    });
    console.log(`==============================\n`);

    this.gui.add('group', { name: 'Scene Navigation', open: false });

    // Scene selector dropdown
    this.controls.sceneSelector = this.gui.add('list', {
      name: 'Select Scene',
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
    this.controls.infoDisplay = this.gui.add('string', {
      name: 'Info',
      value: 'Select a scene to begin',
      height: 60,
      mode: 'text'
    });
  }

  /**
   * Camera & View Controls (Row 2)
   */
  private setupCameraControls(): void {
    this.gui.add('group', { name: 'Camera & View', open: false });

    if (this.camera && (this.camera as THREE.PerspectiveCamera).fov !== undefined) {
      const perspCamera = this.camera as THREE.PerspectiveCamera;
      this.state.cameraFOV = perspCamera.fov;

      // Field of View
      this.controls.fovControl = this.gui.add('slide', {
        name: 'FOV',
        min: 30,
        max: 120,
        value: this.state.cameraFOV,
        precision: 0,
        step: 5
      }).onChange((value: number) => {
        this.state.cameraFOV = value;
        perspCamera.fov = value;
        perspCamera.updateProjectionMatrix();
      });
      this.controlRefs.push(this.controls.fovControl);
    }

    // Reset Camera button
    const resetCamBtn = this.gui.add('button', {
      name: 'Reset Camera',
      fontColor: '#88ff88'
    }).onChange(() => {
      this.resetCamera();
    });
    this.controlRefs.push(resetCamBtn);

    // Renderer Info
    if (this.renderer) {
      const info = this.renderer.info;
      this.controls.rendererInfo = this.gui.add('string', {
        name: 'Renderer Info',
        value: `Triangles: ${info.render.triangles}\nCalls: ${info.render.calls}`,
        height: 40,
        mode: 'text'
      });
      this.controlRefs.push(this.controls.rendererInfo);
    }
  }

  /**
   * NeRF/Luma Settings (Row 3)
   */
  private setupNeRFControls(): void {
    this.gui.add('group', { name: 'NeRF / Luma Settings', open: false });

    // Current NeRF URL display
    const currentScene = this.sceneManager.getCurrentScene();
    this.state.nerfURL = currentScene ? currentScene.url : '';

    const urlControl = this.gui.add('string', {
      name: 'Current URL',
      value: this.state.nerfURL,
      height: 50,
      mode: 'text'
    });
    this.controls.currentUrl = urlControl;
    this.controlRefs.push(urlControl);

    // Custom URL input button
    const customURLBtn = this.gui.add('button', {
      name: 'Load Custom URL',
      fontColor: '#88ccff'
    }).onChange(() => {
      this.loadCustomNeRFURL();
    });
    this.controlRefs.push(customURLBtn);

    // Loading Animation toggle
    const loadAnimControl = this.gui.add('bool', {
      name: 'Loading Animation',
      value: this.state.loadingAnimation
    }).onChange((value: boolean) => {
      this.state.loadingAnimation = value;
      // Note: This affects next load, not current model
    });
    this.controlRefs.push(loadAnimControl);

    // Particle Reveal toggle
    const particleControl = this.gui.add('bool', {
      name: 'Particle Reveal',
      value: this.state.particleReveal
    }).onChange((value: boolean) => {
      this.state.particleReveal = value;
      // Note: This affects next load, not current model
    });
    this.controlRefs.push(particleControl);

    // Shader Integration toggle
    const shaderControl = this.gui.add('bool', {
      name: 'Shader Integration',
      value: this.state.enableShaderIntegration
    }).onChange((value: boolean) => {
      this.state.enableShaderIntegration = value;
      // Note: This affects next load, not current model
    });
    this.controlRefs.push(shaderControl);

    // Reload Current Scene button
    const reloadBtn = this.gui.add('button', {
      name: 'Reload with Settings',
      fontColor: '#ffaa44'
    }).onChange(() => {
      this.reloadCurrentScene();
    });
    this.controlRefs.push(reloadBtn);
  }

  /**
   * Geospatial Positioning Controls (Row 4)
   */
  private setupGeospatialControls(): void {
    this.gui.add('group', { name: 'Geospatial Position', open: false });

    const currentScene = this.sceneManager.getCurrentScene();
    const location = currentScene?.location;
    const geoManager = this.nerfLoader.getGeoManager();
    const origin = geoManager.getOrigin();

    let positionInfo = 'No scene loaded';
    if (location) {
      const lat = location.latitude.toFixed(6);
      const lon = location.longitude.toFixed(6);
      const alt = location.altitude?.toFixed(1) || '0.0';
      positionInfo = `Lat: ${lat}\nLon: ${lon}\nAlt: ${alt}m`;

      if (origin && (origin.latitude !== location.latitude || origin.longitude !== location.longitude)) {
        const distance = geoManager.calculateDistance(origin, location);
        positionInfo += `\n\nDistance from origin:\n${distance.toFixed(0)}m`;
      } else if (origin) {
        positionInfo += '\n\n(Origin)';
      }
    }

    this.controls.locationInfo = this.gui.add('string', {
      name: 'Location',
      value: positionInfo,
      height: 80,
      mode: 'text'
    });
    this.controlRefs.push(this.controls.locationInfo);

    // Reset Origin button
    const resetOriginBtn = this.gui.add('button', {
      name: 'Reset Origin',
      fontColor: '#ff8888'
    }).onChange(() => {
      geoManager.reset();
      console.log('Geospatial origin reset');
      this.updateGeospatialInfo();
    });
    this.controlRefs.push(resetOriginBtn);

    // Manual Position Override
    const manualPosBtn = this.gui.add('button', {
      name: 'Manual Position',
      fontColor: '#cccccc'
    }).onChange(() => {
      this.manualPositionOverride();
    });
    this.controlRefs.push(manualPosBtn);
  }

  /**
   * Environment controls (time of day, lighting) (Row 5)
   */
  private setupEnvironmentControls(): void {
    this.gui.add('group', { name: 'Environment & Lighting', open: false });

    // Time of day slider
    const timeControl = this.gui.add('slide', {
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
    this.controlRefs.push(timeControl);

    // Ambient Light Intensity
    const ambientLight = this.platformEnv.getDirectionalLight();
    const ambientControl = this.gui.add('slide', {
      name: 'Sun Intensity',
      min: 0.1,
      max: 3.0,
      value: 1.5,
      precision: 2,
      step: 0.1
    }).onChange((value: number) => {
      ambientLight.intensity = value;
    });
    this.controlRefs.push(ambientControl);

    // Shadow toggle
    if (this.renderer) {
      const shadowControl = this.gui.add('bool', {
        name: 'Shadows',
        value: this.renderer.shadowMap.enabled
      }).onChange((value: boolean) => {
        if (this.renderer) {
          this.renderer.shadowMap.enabled = value;
        }
      });
      this.controlRefs.push(shadowControl);
    }

    // Fog controls (from main)
    if (this.fogControls) {
      this.state.fogEnabled = this.fogControls.enabled;
      this.state.fogDensity = this.fogControls.density;

      const fogToggle = this.gui.add('bool', {
        name: 'Fog',
        value: this.fogControls.enabled
      }).onChange((value: boolean) => {
        this.state.fogEnabled = value;
        this.fogControls?.setEnabled(value);
      });
      this.controlRefs.push(fogToggle);

      const fogDensity = this.gui.add('slide', {
        name: 'Fog Density',
        min: 0,
        max: 0.5,
        value: this.fogControls.density,
        precision: 3,
        step: 0.005
      }).onChange((value: number) => {
        this.state.fogDensity = value;
        this.fogControls?.setDensity(value);
      });
      this.controlRefs.push(fogDensity);

      const fogColor = this.gui.add('color', {
        name: 'Fog Color',
        value: this.fogControls.color
      }).onChange((value: string) => {
        this.fogControls?.setColor(value);
      });
      this.controlRefs.push(fogColor);
    }

    // Splat slice toggle for cross-section debugging
    const sliceToggle = this.gui.add('bool', {
      name: 'Slice Mode',
      value: false
    }).onChange((value: boolean) => {
      this.state.sliceEnabled = value;
      if (!value) {
        this.nerfLoader.setSlicePlane(false);
      } else {
        this.applySlices();
      }
    });
    this.controls.sliceToggle = sliceToggle;
    this.controlRefs.push(sliceToggle);

    type SliceKey =
      | 'sliceXNeg'
      | 'sliceXPos'
      | 'sliceYNeg'
      | 'sliceYPos'
      | 'sliceZNeg'
      | 'sliceZPos';

    const makeSliceSlider = (label: string, key: SliceKey, apply: () => void) => {
      const slider = this.gui.add('slide', {
        name: label,
        min: -15,
        max: 15,
        value: this.state[key],
        precision: 2,
        step: 0.1
      }).onChange((value: number) => {
        this.state[key] = value;
        apply();
      });
      this.controlRefs.push(slider);
    };

    makeSliceSlider('Slice -X', 'sliceXNeg', () => this.applySlices());
    makeSliceSlider('Slice +X', 'sliceXPos', () => this.applySlices());
    makeSliceSlider('Slice -Y', 'sliceYNeg', () => this.applySlices());
    makeSliceSlider('Slice +Y', 'sliceYPos', () => this.applySlices());
    makeSliceSlider('Slice -Z', 'sliceZNeg', () => this.applySlices());
    makeSliceSlider('Slice +Z', 'sliceZPos', () => this.applySlices());

    // Clip box helper (diorama bounds visualization)
    const clipHelperControl = this.gui.add('bool', {
      name: 'Show Clip Box',
      value: false
    }).onChange((value: boolean) => {
      this.nerfLoader.setClipHelperVisible(value);
    });
    this.controlRefs.push(clipHelperControl);
  }

  /**
   * Model transformation controls (Row 6)
   */
  private setupModelControls(): void {
    this.gui.add('group', { name: 'Model Adjustments', open: false });

    // Scale slider
    this.controls.scaleSlider = this.gui.add('slide', {
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
    this.controlRefs.push(this.controls.scaleSlider);

    // Vertical offset slider
    this.controls.yOffsetSlider = this.gui.add('slide', {
      name: 'Y Offset',
      min: -20,
      max: 20,
      value: this.state.modelYOffset,
      precision: 1,
      step: 0.5
    }).onChange((value: number) => {
      const container = this.nerfLoader.getContainer();
      const delta = value - this.state.modelYOffset;
      container.position.y += delta;
      this.state.modelYOffset = value;
    });
    this.controlRefs.push(this.controls.yOffsetSlider);

    // Rotation slider
    this.controls.rotationY = this.gui.add('slide', {
      name: 'Rotation Y',
      min: -180,
      max: 180,
      value: this.state.modelRotationY,
      precision: 0,
      step: 5
    }).onChange((value: number) => {
      this.state.modelRotationY = value;
      const container = this.nerfLoader.getContainer();
      container.rotation.y = (value * Math.PI) / 180;
    });
    this.controlRefs.push(this.controls.rotationY);

    // Reset button
    const resetBtn = this.gui.add('button', {
      name: 'Reset Transforms',
      fontColor: '#ff8888'
    }).onChange(() => {
      this.resetModelTransforms();
    });
    this.controlRefs.push(resetBtn);
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
    if (current && this.controls.infoDisplay) {
      const info = `${current.title}\n\n${current.description || 'No description'}`;
      this.controls.infoDisplay.setValue(info);

      // Also update NeRF URL display
      this.state.nerfURL = current.url;
      if (this.controls.currentUrl) {
        this.controls.currentUrl.setValue(current.url);
      }

      // Update geospatial info
      this.updateGeospatialInfo();
    }
  }

  /**
   * Update scene selector value
   */
  private updateSceneSelector(): void {
    const scenes = this.sceneManager.getAllScenes();
    const index = this.state.currentScene;
    if (index >= 0 && index < scenes.length && this.controls.sceneSelector) {
      const sceneLabel = `${index}: ${scenes[index].title}`;
      this.controls.sceneSelector.setValue(sceneLabel);
    }
  }

  /**
   * Update geospatial info display
   */
  private updateGeospatialInfo(): void {
    const currentScene = this.sceneManager.getCurrentScene();
    const location = currentScene?.location;
    const geoManager = this.nerfLoader.getGeoManager();
    const origin = geoManager.getOrigin();

    let positionInfo = 'No scene loaded';
    if (location) {
      const lat = location.latitude.toFixed(6);
      const lon = location.longitude.toFixed(6);
      const alt = location.altitude?.toFixed(1) || '0.0';
      positionInfo = `Lat: ${lat}\nLon: ${lon}\nAlt: ${alt}m`;

      if (origin && (origin.latitude !== location.latitude || origin.longitude !== location.longitude)) {
        const distance = geoManager.calculateDistance(origin, location);
        positionInfo += `\n\nDistance from origin:\n${distance.toFixed(0)}m`;
      } else if (origin) {
        positionInfo += '\n\n(Origin)';
      }
    }

    if (this.controls.locationInfo) {
      this.controls.locationInfo.setValue(positionInfo);
    }
  }

  /**
   * Reset camera to default position
   */
  private resetCamera(): void {
    if (this.camera) {
      this.camera.position.set(30, 20, 30);
      this.camera.lookAt(0, 0, 0);

      if ((this.camera as THREE.PerspectiveCamera).fov !== undefined) {
        const perspCamera = this.camera as THREE.PerspectiveCamera;
        perspCamera.fov = 75;
        perspCamera.updateProjectionMatrix();
        this.state.cameraFOV = 75;
        if (this.controls.fovControl) {
          this.controls.fovControl.setValue(75);
        }
      }

      console.log('Camera reset to default position');
    }
  }

  /**
   * Load custom NeRF URL via prompt
   */
  private loadCustomNeRFURL(): void {
    const url = prompt('Enter Luma capture URL:', 'https://lumalabs.ai/capture/');
    if (url && url.trim()) {
      this.loadNeRFFromURL(url.trim());
    }
  }

  /**
   * Load NeRF from custom URL
   */
  private async loadNeRFFromURL(url: string): Promise<void> {
    try {
      console.log(`Loading custom NeRF from: ${url}`);
      await this.nerfLoader.loadNeRFModel(url, {
        loadingAnimationEnabled: this.state.loadingAnimation,
        particleRevealEnabled: this.state.particleReveal,
        enableThreeShaderIntegration: this.state.enableShaderIntegration
      });

      this.state.nerfURL = url;
      if (this.controls.currentUrl) {
        this.controls.currentUrl.setValue(url);
      }
      console.log('Custom NeRF loaded successfully');
    } catch (error) {
      console.error('Failed to load custom NeRF:', error);
      alert('Failed to load NeRF from URL. Check console for details.');
    }
  }

  /**
   * Reload current scene with updated settings
   */
  private async reloadCurrentScene(): Promise<void> {
    const currentScene = this.sceneManager.getCurrentScene();
    if (currentScene) {
      try {
        console.log('Reloading scene with updated settings...');
        await this.nerfLoader.loadNeRFModel(currentScene.url, {
          location: currentScene.location,
          loadingAnimationEnabled: this.state.loadingAnimation,
          particleRevealEnabled: this.state.particleReveal,
          enableThreeShaderIntegration: this.state.enableShaderIntegration
        });
        console.log('Scene reloaded successfully');
      } catch (error) {
        console.error('Failed to reload scene:', error);
      }
    }
  }

  /**
   * Manual position override for model
   */
  private manualPositionOverride(): void {
    const x = prompt('Enter X position:', '0');
    const y = prompt('Enter Y position:', '0');
    const z = prompt('Enter Z position:', '0');

    if (x !== null && y !== null && z !== null) {
      const container = this.nerfLoader.getContainer();
      container.position.set(parseFloat(x), parseFloat(y), parseFloat(z));
      console.log(`Model position set to: (${x}, ${y}, ${z})`);
    }
  }

  /**
   * Reset model transforms to default
   */
  private resetModelTransforms(): void {
    this.state.modelScale = 1.0;
    this.state.modelYOffset = 0;
    this.state.modelRotationY = 0;

    const container = this.nerfLoader.getContainer();
    this.nerfLoader.setScale(1.0);
    container.position.y = 0;
    container.rotation.y = 0;

    // Update UI sliders
    this.controls.scaleSlider?.setValue(1.0);
    this.controls.yOffsetSlider?.setValue(0);
    this.controls.rotationY?.setValue(0);
  }

  /**
   * Get the GUI instance
   */
  public getGui(): Gui {
    return this.gui;
  }

  /**
   * Synchronize UI state when scenes are changed externally (e.g., timeline HUD)
   */
  public syncToScene(index: number): void {
    this.state.currentScene = index;
    this.updateSceneSelector();
    this.updateSceneInfo();
    // Reapply slice planes/state when scenes change
    if (this.state.sliceEnabled) {
      this.applySlices();
      this.controls.sliceToggle?.setValue(true);
    }
  }

  /**
   * Apply current slice state to the loader
   */
  private applySlices(): void {
    if (!this.state.sliceEnabled) {
      this.nerfLoader.setSlicePlane(false);
      return;
    }
    this.nerfLoader.setSlicePlanes({
      xNeg: this.state.sliceXNeg,
      xPos: this.state.sliceXPos,
      yNeg: this.state.sliceYNeg,
      yPos: this.state.sliceYPos,
      zNeg: this.state.sliceZNeg,
      zPos: this.state.sliceZPos,
    });
  }

  /**
   * Cleanup and dispose - Memory safe cleanup of all resources
   */
  public dispose(): void {
    console.log('UIManager: Starting cleanup...');

    // Remove resize handler
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = undefined;
    }

    // Clear all control references
    this.controlRefs.forEach(control => {
      if (control && typeof control.dispose === 'function') {
        control.dispose();
      }
    });
    this.controlRefs = [];

    // Dispose of GUI
    if (this.gui) {
      this.gui.dispose();
    }

    console.log('UIManager: Cleanup complete');
  }

  /**
   * Update renderer info (call this in animation loop if needed)
   */
  public updateRendererInfo(): void {
    if (this.renderer) {
      const info = this.renderer.info;
      const infoText = `Triangles: ${info.render.triangles}\nCalls: ${info.render.calls}`;
      this.controls.rendererInfo?.setValue(infoText);
    }
  }
}
