import { GeoLocation } from './GeoSpatial.js';

/**
 * Scene metadata interface
 * Each scene represents a NeRF capture with its location and narrative context
 */
export interface SceneMetadata {
  id: string;
  title: string;
  url: string;
  location: GeoLocation;
  description?: string;
  captureDate?: string;
  tags?: string[];
}

/**
 * Local narrative scene database
 * All scene metadata is stored here - no external API calls needed
 *
 * Note: Update these URLs with actual Luma capture URLs for your narrative
 */
export const NARRATIVE_SCENES: SceneMetadata[] = [
  {
    "id": "brc2010",
    "title": "BRC2010",
    "url": "https://lumalabs.ai/capture/94af1531-42b8-40d2-8a93-4de2400bfd3f",
    "location": { "latitude": 40.4155, "longitude": -3.7074, "altitude": 650 },
    "description": "A beautiful capture of BRC2010",
    "captureDate": "2024-03-15",
    "tags": ["nature", "urban"]
  },
  {
    "id": "orange-burger",
    "title": "Orange burger",
    "url": "https://lumalabs.ai/capture/e2ff62ba-45c5-4ecd-b3d6-8cdf3e573d1a",
    "location": { "latitude": 40.4155, "longitude": -3.7074, "altitude": 650 },
    "description": "A beautiful capture of Orange burger",
    "captureDate": "2024-03-15",
    "tags": ["nature", "urban"]
  },
  {
    "id": "art-hotel",
    "title": "Art hotel",
    "url": "https://lumalabs.ai/capture/d4f9fc1b-adf7-457a-84f4-6e58ade320bb",
    "location": { "latitude": 40.4155, "longitude": -3.7074, "altitude": 650 },
    "description": "A beautiful capture of Art hotel",
    "captureDate": "2024-03-15",
    "tags": ["nature", "urban"]
  }
];

/**
 * Helper function to get a scene by ID
 */
export function getSceneById(id: string): SceneMetadata | undefined {
  return NARRATIVE_SCENES.find(scene => scene.id === id);
}

/**
 * Helper function to get a scene by index
 */
export function getSceneByIndex(index: number): SceneMetadata | undefined {
  return NARRATIVE_SCENES[index];
}

/**
 * Get total number of scenes
 */
export function getSceneCount(): number {
  return NARRATIVE_SCENES.length;
}
