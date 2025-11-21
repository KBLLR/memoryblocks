import * as THREE from 'three';
import { Gui } from 'uil';
import { PlatformEnvironment } from './PlatformEnvironment.js';

/**
 * InWorldGUIManager - Creates interactive 3D GUI panels in the scene
 *
 * This manager creates UIL-based GUIs rendered as textures on 3D planes,
 * allowing for immersive in-world UI controls for terrain and sky settings.
 *
 * Features:
 * - Terrain controls (height, expo, movement, levels, frequency)
 * - Sky controls (clouds, time, azimuth)
 * - Interactive 3D planes with GUI textures
 * - Mouse interaction support
 */

export interface TerrainSettings {
  height: number;
  expo: number;
  move: [number, number];
  level: [number, number, number];
  frequency: [number, number, number];
}

export interface SkySettings {
  t: number;
  fog: number;
  cloud_size: number;
  cloud_covr: number;
  cloud_dens: number;
  inclination: number;
  azimuth: number;
  hour: number;
}

export interface InWorldGUIConfig {
  guiWidth?: number;
  guiHeight?: number;
  planeWidth?: number;
  planeHeight?: number;
  terrainPosition?: THREE.Vector3;
  skyPosition?: THREE.Vector3;
  enableInteraction?: boolean;
}

export class InWorldGUIManager {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private platformEnv?: PlatformEnvironment;

  // GUI instances
  private terrainGui?: Gui;
  private skyGui?: Gui;

  // 3D GUI planes
  private terrainPlane?: THREE.Mesh;
  private skyPlane?: THREE.Mesh;
  private interactive: THREE.Group;

  // GUI textures
  private terrainTexture?: THREE.Texture;
  private skyTexture?: THREE.Texture;

  // Settings
  private terrainSettings: TerrainSettings;
  private skySettings: SkySettings;

  // Interaction
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private isDragging: boolean = false;

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer: THREE.WebGLRenderer,
    platformEnv?: PlatformEnvironment,
    config: InWorldGUIConfig = {}
  ) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.platformEnv = platformEnv;

    // Default settings
    this.terrainSettings = {
      height: 5,
      expo: 2,
      move: [0, 0],
      level: [1, 0.2, 0.1],
      frequency: [0.016, 0.05, 0.2],
    };

    this.skySettings = {
      t: 0,
      fog: 0,
      cloud_size: 0.45,
      cloud_covr: 0.3,
      cloud_dens: 40,
      inclination: 45,
      azimuth: 90,
      hour: 12,
    };

    // Interaction setup
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Create interactive group
    this.interactive = new THREE.Group();
    this.scene.add(this.interactive);

    // Initialize GUIs
    this.initializeTerrainGUI(config);
    setTimeout(() => this.initializeSkyGUI(config), 100);

    // Setup interaction
    if (config.enableInteraction !== false) {
      this.setupInteraction();
    }
  }

  /**
   * Initialize terrain GUI controls
   */
  private initializeTerrainGUI(config: InWorldGUIConfig): void {
    const guiWidth = config.guiWidth || 128 * 8; // Wider for platform
    const guiHeight = config.guiHeight || 200;

    // Create UIL GUI in canvas mode
    this.terrainGui = new Gui({
      w: guiWidth,
      maxHeight: guiHeight,
      parent: null,
      isCanvas: true,
      close: false,
      transparent: true,
    }).onChange((v: string) => {
      this.onTerrainChange(v);
    });

    // Add terrain controls
    this.terrainGui.add(this.terrainSettings, 'height', {
      type: 'Circular',
      min: 0,
      max: 10,
      w: 128,
      precision: 2,
      fontColor: '#D4B87B',
    });

    this.terrainGui.add(this.terrainSettings, 'expo', {
      type: 'Knob',
      min: 0,
      max: 10,
      w: 128,
      precision: 2,
      fontColor: '#D4B87B',
    });

    this.terrainGui.add(this.terrainSettings, 'move', {
      type: 'joystick',
      w: 128,
      precision: 2,
      fontColor: '#D4B87B',
    });

    this.terrainGui.add(this.terrainSettings, 'level', {
      type: 'graph',
      w: 128,
      precision: 2,
      fontColor: '#D4B87B',
      autoWidth: false,
    });

    this.terrainGui.add(this.terrainSettings, 'frequency', {
      type: 'graph',
      w: 128,
      precision: 2,
      multiplicator: 0.25,
      fontColor: '#D4B87B',
      autoWidth: false,
    });

    // Setup draw callback to update texture
    this.terrainGui.onDraw = () => {
      if (!this.terrainTexture && this.terrainGui?.canvas) {
        this.terrainTexture = new THREE.Texture(this.terrainGui.canvas);
        this.terrainTexture.minFilter = THREE.LinearFilter;
        this.terrainTexture.colorSpace = THREE.SRGBColorSpace;

        // Create terrain plane
        this.createTerrainPlane(config);
      }

      if (this.terrainTexture) {
        this.terrainTexture.needsUpdate = true;
      }
    };
  }

  /**
   * Initialize sky GUI controls
   */
  private initializeSkyGUI(config: InWorldGUIConfig): void {
    const guiWidth = config.guiWidth || 128 * 8; // Wider for platform
    const guiHeight = config.guiHeight || 200;

    // Create UIL GUI in canvas mode
    this.skyGui = new Gui({
      w: guiWidth,
      maxHeight: guiHeight,
      parent: null,
      isCanvas: true,
      close: false,
      transparent: true,
    }).onChange((v: string) => {
      this.onSkyChange(v);
    });

    // Add sky controls
    this.skyGui.add(this.skySettings, 'cloud_size', {
      type: 'Circular',
      min: 0,
      max: 1,
      w: 128,
      precision: 2,
      fontColor: '#7BD4B8',
    });

    this.skyGui.add(this.skySettings, 'cloud_covr', {
      type: 'Circular',
      min: 0,
      max: 1,
      w: 128,
      precision: 2,
      fontColor: '#7BD4B8',
    });

    this.skyGui.add(this.skySettings, 'cloud_dens', {
      type: 'Circular',
      min: 0,
      max: 100,
      w: 128,
      precision: 2,
      fontColor: '#7BD4B8',
    });

    this.skyGui.add(this.skySettings, 'azimuth', {
      type: 'Circular',
      min: 0,
      max: 360,
      w: 128,
      precision: 0,
      fontColor: '#D4B87B',
    });

    this.skyGui.add(this.skySettings, 'hour', {
      type: 'Circular',
      min: 0,
      max: 24,
      w: 128,
      precision: 2,
      fontColor: '#D47B7B',
    });

    // Setup draw callback to update texture
    this.skyGui.onDraw = () => {
      if (!this.skyTexture && this.skyGui?.canvas) {
        this.skyTexture = new THREE.Texture(this.skyGui.canvas);
        this.skyTexture.minFilter = THREE.LinearFilter;
        this.skyTexture.colorSpace = THREE.SRGBColorSpace;

        // Create sky plane
        this.createSkyPlane(config);
      }

      if (this.skyTexture) {
        this.skyTexture.needsUpdate = true;
      }
    };
  }

  /**
   * Create the terrain GUI plane in 3D space
   */
  private createTerrainPlane(config: InWorldGUIConfig): void {
    const planeWidth = config.planeWidth || 60; // Platform width
    const planeHeight = config.planeHeight || 8;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 5, 1);
    geometry.rotateX(-Math.PI * 0.5); // Lay flat on ground

    const material = new THREE.MeshBasicMaterial({
      map: this.terrainTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false, // Prevent z-fighting
    });

    this.terrainPlane = new THREE.Mesh(geometry, material);
    // Position at front edge of platform, slightly above ground
    this.terrainPlane.position.copy(
      config.terrainPosition || new THREE.Vector3(0, 0.01, 30)
    );
    this.terrainPlane.name = 'terrain_gui';

    this.interactive.add(this.terrainPlane);
  }

  /**
   * Create the sky GUI plane in 3D space
   */
  private createSkyPlane(config: InWorldGUIConfig): void {
    const planeWidth = config.planeWidth || 60; // Platform width
    const planeHeight = config.planeHeight || 8;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, 5, 1);
    geometry.rotateX(-Math.PI * 0.5); // Lay flat on ground

    const material = new THREE.MeshBasicMaterial({
      map: this.skyTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false, // Prevent z-fighting
    });

    this.skyPlane = new THREE.Mesh(geometry, material);
    // Position at back edge of platform, slightly above ground
    this.skyPlane.position.copy(
      config.skyPosition || new THREE.Vector3(0, 0.01, -30)
    );
    this.skyPlane.name = 'sky_gui';

    this.interactive.add(this.skyPlane);
  }

  /**
   * Setup mouse interaction for the GUI planes
   */
  private setupInteraction(): void {
    const domElement = this.renderer.domElement;

    domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
    domElement.addEventListener('pointermove', this.onPointerMove.bind(this));
    domElement.addEventListener('pointerup', this.onPointerUp.bind(this));
  }

  /**
   * Handle pointer down events
   */
  private onPointerDown(event: PointerEvent): void {
    this.updateMousePosition(event);
    const intersects = this.getIntersects();

    if (intersects.length > 0) {
      this.isDragging = true;
    }
  }

  /**
   * Handle pointer move events
   */
  private onPointerMove(event: PointerEvent): void {
    this.updateMousePosition(event);

    if (this.isDragging) {
      // Handle dragging interaction
      const intersects = this.getIntersects();
      if (intersects.length > 0) {
        // You can add custom interaction logic here
        console.log('Dragging over GUI plane:', intersects[0].object.name);
      }
    }
  }

  /**
   * Handle pointer up events
   */
  private onPointerUp(_event: PointerEvent): void {
    this.isDragging = false;
  }

  /**
   * Update mouse position from event
   */
  private updateMousePosition(event: PointerEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * Get raycaster intersections with GUI planes
   */
  private getIntersects(): THREE.Intersection[] {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObjects(this.interactive.children, true);
  }

  /**
   * Handle terrain settings changes
   */
  private onTerrainChange(value: string): void {
    console.log('Terrain changed:', value, this.terrainSettings);
    // You can add custom terrain update logic here
    // For example, update a terrain mesh or shader uniforms
  }

  /**
   * Handle sky settings changes
   */
  private onSkyChange(value: string): void {
    console.log('Sky changed:', value, this.skySettings);

    // Update platform environment if available
    if (this.platformEnv) {
      // Update time of day
      this.platformEnv.timeOfDay = this.skySettings.hour;
    }
  }

  /**
   * Get current terrain settings
   */
  public getTerrainSettings(): TerrainSettings {
    return { ...this.terrainSettings };
  }

  /**
   * Get current sky settings
   */
  public getSkySettings(): SkySettings {
    return { ...this.skySettings };
  }

  /**
   * Set terrain settings programmatically
   */
  public setTerrainSettings(settings: Partial<TerrainSettings>): void {
    Object.assign(this.terrainSettings, settings);
    this.onTerrainChange('programmatic');
  }

  /**
   * Set sky settings programmatically
   */
  public setSkySettings(settings: Partial<SkySettings>): void {
    Object.assign(this.skySettings, settings);
    this.onSkyChange('programmatic');

    // Update platform environment if available
    if (this.platformEnv && settings.hour !== undefined) {
      this.platformEnv.timeOfDay = settings.hour;
    }
  }

  /**
   * Toggle GUI plane visibility
   */
  public setVisible(visible: boolean): void {
    this.interactive.visible = visible;
  }

  /**
   * Get the interactive group
   */
  public getInteractiveGroup(): THREE.Group {
    return this.interactive;
  }

  /**
   * Dispose and cleanup
   */
  public dispose(): void {
    // Dispose GUIs
    if (this.terrainGui) {
      this.terrainGui.dispose();
    }
    if (this.skyGui) {
      this.skyGui.dispose();
    }

    // Dispose textures
    if (this.terrainTexture) {
      this.terrainTexture.dispose();
    }
    if (this.skyTexture) {
      this.skyTexture.dispose();
    }

    // Dispose planes
    if (this.terrainPlane) {
      this.terrainPlane.geometry.dispose();
      (this.terrainPlane.material as THREE.Material).dispose();
    }
    if (this.skyPlane) {
      this.skyPlane.geometry.dispose();
      (this.skyPlane.material as THREE.Material).dispose();
    }

    // Remove from scene
    this.scene.remove(this.interactive);
  }
}
