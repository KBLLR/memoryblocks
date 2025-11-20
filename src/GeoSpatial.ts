import * as THREE from 'three';

/**
 * GeoSpatial - Coordinate transformation utilities
 *
 * Handles conversion between geographic coordinates (lat/lon) and
 * Three.js scene coordinates for proper model positioning.
 *
 * Uses equirectangular projection for simplicity and performance.
 * Works well for scenes within ~10km radius.
 */

export interface GeoLocation {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export class GeoSpatialManager {
  private origin: GeoLocation | null = null;
  private readonly EARTH_RADIUS = 6371000; // meters

  /**
   * Sets the reference origin point for the scene
   * All subsequent positions will be relative to this origin
   */
  public setOrigin(location: GeoLocation): void {
    this.origin = location;
    console.log('Geospatial origin set to:', location);
  }

  /**
   * Gets the current origin
   */
  public getOrigin(): GeoLocation | null {
    return this.origin;
  }

  /**
   * Converts a geographic location to scene coordinates
   * Returns position relative to the origin in meters
   * Uses equirectangular projection (suitable for small areas)
   */
  public geoToScene(location: GeoLocation): THREE.Vector3 {
    if (!this.origin) {
      console.warn('No origin set, using location as origin');
      this.setOrigin(location);
      return new THREE.Vector3(0, location.altitude || 0, 0);
    }

    const lat0 = THREE.MathUtils.degToRad(this.origin.latitude);
    const lon0 = THREE.MathUtils.degToRad(this.origin.longitude);
    const lat = THREE.MathUtils.degToRad(location.latitude);
    const lon = THREE.MathUtils.degToRad(location.longitude);

    // Equirectangular projection (suitable for small distances)
    // X = East, Y = Up, Z = North (negated for Three.js convention)
    const x = (lon - lon0) * Math.cos((lat0 + lat) / 2) * this.EARTH_RADIUS;
    const z = -(lat - lat0) * this.EARTH_RADIUS; // Negative for Three.js coordinate system
    const y = (location.altitude || 0) - (this.origin.altitude || 0);

    return new THREE.Vector3(x, y, z);
  }

  /**
   * Calculates the approximate distance between two geographic locations in meters
   */
  public calculateDistance(loc1: GeoLocation, loc2: GeoLocation): number {
    const lat1 = THREE.MathUtils.degToRad(loc1.latitude);
    const lat2 = THREE.MathUtils.degToRad(loc2.latitude);
    const deltaLat = lat2 - lat1;
    const deltaLon = THREE.MathUtils.degToRad(loc2.longitude - loc1.longitude);

    // Haversine formula
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.EARTH_RADIUS * c;
  }

  /**
   * Resets the origin
   */
  public reset(): void {
    this.origin = null;
  }
}
