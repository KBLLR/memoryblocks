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
    id: 'plaza-mayor',
    title: 'Plaza Mayor',
    url: 'https://lumalabs.ai/capture/ca9ea966-ca24-4ec1-ab0f-af665cb546ff',
    location: {
      latitude: 40.4155,
      longitude: -3.7074,
      altitude: 650
    },
    description: 'Historic main square in Madrid, captured on a sunny afternoon.',
    captureDate: '2024-03-15',
    tags: ['historic', 'urban', 'plaza']
  },
  {
    id: 'retiro-park',
    title: 'Retiro Park Lake',
    url: 'https://lumalabs.ai/capture/e4c1b5f8-4e0f-4c94-90c3-4d8d8d8d8d8d',
    location: {
      latitude: 40.4153,
      longitude: -3.6844,
      altitude: 637
    },
    description: 'Peaceful lake view in the heart of Retiro Park.',
    captureDate: '2024-03-16',
    tags: ['nature', 'park', 'water']
  },
  {
    id: 'mercado-barcelo',
    title: 'Mercado de Barceló',
    url: 'https://lumalabs.ai/capture/786aaf8b-1b5a-4c88-9b0a-8e8e8e8e3e9e',
    location: {
      latitude: 40.4280,
      longitude: -3.6995,
      altitude: 665
    },
    description: 'Modern market hall blending traditional and contemporary architecture.',
    captureDate: '2024-03-17',
    tags: ['architecture', 'market', 'modern']
  },
  {
    id: 'temple-debod',
    title: 'Temple of Debod',
    url: 'https://lumalabs.ai/capture/a1b2c3d4-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    location: {
      latitude: 40.4240,
      longitude: -3.7177,
      altitude: 618
    },
    description: 'Ancient Egyptian temple relocated to Madrid, captured at sunset.',
    captureDate: '2024-03-18',
    tags: ['historic', 'monument', 'sunset']
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
