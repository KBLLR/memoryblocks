import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

/**
 * PlatformEnvironment - Central platform and dynamic sky system
 *
 * This module creates the core 3D environment:
 * - A flat ground platform at the center (60x60 units)
 * - Dynamic sky dome with configurable sun position
 * - Synchronized directional lighting for day/night cycles
 */

export interface PlatformConfig {
  size?: number;
  height?: number;
  color?: number;
  roughness?: number;
}

export class PlatformEnvironment {
  private scene: THREE.Scene;
  private platform: THREE.Mesh;
  private sky: Sky;
  private sun: THREE.Vector3;
  private directionalLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;

  // Time of day in hours (0-24)
  private _timeOfDay: number = 12;

  constructor(scene: THREE.Scene, config: PlatformConfig = {}) {
    this.scene = scene;
    this.sun = new THREE.Vector3();

    const {
      size = 60,
      height = 1.5,
      color = 0x8b7355,  // Earth tone
      roughness = 0.9
    } = config;

    // Create platform base
    this.platform = this.createPlatform(size, height, color, roughness);
    this.scene.add(this.platform);

    // Create sky dome
    this.sky = this.createSky();
    this.scene.add(this.sky);

    // Create lighting
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.ambientLight);

    this.directionalLight = this.createDirectionalLight();
    this.scene.add(this.directionalLight);

    // Initialize with default time
    this.updateSunPosition(this._timeOfDay);
  }

  /**
   * Creates the central platform base
   */
  private createPlatform(size: number, height: number, color: number, roughness: number): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(size, height, size);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness: 0.1
    });

    const mesh = new THREE.Mesh(geometry, material);
    // Position so top surface is at Y=0
    mesh.position.y = -height / 2;
    mesh.receiveShadow = true;
    mesh.castShadow = false;

    return mesh;
  }

  /**
   * Creates the sky dome using Three.js Sky shader
   */
  private createSky(): Sky {
    const sky = new Sky();
    sky.scale.setScalar(450000);

    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;

    return sky;
  }

  /**
   * Creates the main directional light (sun)
   */
  private createDirectionalLight(): THREE.DirectionalLight {
    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.castShadow = true;

    // Shadow camera configuration
    const shadowSize = 100;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 500;
    light.shadow.camera.left = -shadowSize;
    light.shadow.camera.right = shadowSize;
    light.shadow.camera.top = shadowSize;
    light.shadow.camera.bottom = -shadowSize;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.bias = -0.0001;

    return light;
  }

  /**
   * Updates sun position based on time of day
   * @param hour - Time in hours (0-24)
   */
  public updateSunPosition(hour: number): void {
    this._timeOfDay = hour;

    // Calculate sun elevation angle
    // 0h (midnight) = -90°, 6h (sunrise) = 0°, 12h (noon) = 90°, 18h (sunset) = 0°, 24h (midnight) = -90°
    const normalizedHour = hour % 24;
    const sunElevation = Math.sin((normalizedHour / 24) * Math.PI * 2 - Math.PI / 2) * Math.PI / 2;

    // Azimuth: fixed to south for simplicity
    const azimuth = Math.PI; // South

    // Calculate sun position
    const distance = 400000;
    this.sun.set(
      Math.cos(sunElevation) * Math.sin(azimuth) * distance,
      Math.sin(sunElevation) * distance,
      Math.cos(sunElevation) * Math.cos(azimuth) * distance
    );

    // Update sky shader
    this.sky.material.uniforms['sunPosition'].value.copy(this.sun);

    // Update directional light to match sun
    this.directionalLight.position.copy(this.sun);
    this.directionalLight.position.normalize().multiplyScalar(200);

    // Adjust light intensity based on sun elevation
    const intensity = Math.max(0.1, Math.sin(sunElevation) * 1.5);
    this.directionalLight.intensity = intensity;

    // Adjust ambient light for day/night
    const ambientIntensity = Math.max(0.2, Math.sin(sunElevation) * 0.6);
    this.ambientLight.intensity = ambientIntensity;

    // Adjust light color for dawn/dusk
    if (sunElevation < 0.2) {
      const t = Math.max(0, sunElevation + 0.2) / 0.4;
      const dawnColor = new THREE.Color(0xff8844);
      const dayColor = new THREE.Color(0xffffff);
      this.directionalLight.color.copy(dawnColor).lerp(dayColor, t);
    } else {
      this.directionalLight.color.set(0xffffff);
    }
  }

  /**
   * Gets the current time of day
   */
  public get timeOfDay(): number {
    return this._timeOfDay;
  }

  /**
   * Sets the time of day
   */
  public set timeOfDay(hour: number) {
    this.updateSunPosition(hour);
  }

  /**
   * Gets the platform mesh
   */
  public getPlatform(): THREE.Mesh {
    return this.platform;
  }

  /**
   * Gets the directional light (sun)
   */
  public getDirectionalLight(): THREE.DirectionalLight {
    return this.directionalLight;
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this.platform.geometry.dispose();
    (this.platform.material as THREE.Material).dispose();
    this.sky.geometry.dispose();
    this.sky.material.dispose();
  }
}
