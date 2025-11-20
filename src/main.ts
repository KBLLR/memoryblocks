import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PlatformEnvironment } from './PlatformEnvironment.js';
import { NeRFLoader } from './NeRFLoader.js';

/**
 * MemoryBlocks - Stage 3: NeRF Model Loading
 * Dynamic Gaussian Splatting NeRF visualization
 */

// Scene setup
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(30, 20, 30);
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const appElement = document.getElementById('app');
if (appElement) {
  appElement.appendChild(renderer.domElement);
}

// Orbit controls for navigation
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera going below ground
controls.target.set(0, 0, 0);

// Initialize platform environment
const platformEnvironment = new PlatformEnvironment(scene, {
  size: 60,
  height: 1.5,
  color: 0x8b7355,
  roughness: 0.9
});

// Set initial time to afternoon for nice lighting
platformEnvironment.timeOfDay = 14; // 2 PM

// Initialize NeRF loader
const nerfLoader = new NeRFLoader(scene);

// Test content: Axes helper (for reference)
const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);

// Sample test data with geolocation
// Format: { url, location: { latitude, longitude, altitude } }
const sampleScenes = [
  {
    url: 'https://lumalabs.ai/capture/ca9ea966-ca24-4ec1-ab0f-af665cb546ff',
    name: 'Test Scene 1',
    location: { latitude: 40.4211, longitude: -3.7101, altitude: 0 }
  },
  {
    url: 'https://lumalabs.ai/capture/e4c1b5f8-4e0f-4c94-90c3-4d8d8d8d8d8d',
    name: 'Test Scene 2',
    location: { latitude: 40.4280, longitude: -3.6995, altitude: 0 } // ~800m from first scene
  }
];

/**
 * Test function to load a NeRF model with geolocation
 * @param index - Index of the sample scene to load
 * @param useLocation - Whether to use geolocation positioning (default: true)
 */
async function loadTestNeRF(index: number = 0, useLocation: boolean = true) {
  const scene = sampleScenes[index];
  if (!scene) {
    console.error(`No sample scene at index ${index}`);
    return;
  }

  try {
    console.log(`Loading NeRF: ${scene.name}...`);

    const model = await nerfLoader.loadNeRFModel(scene.url, {
      location: useLocation ? scene.location : undefined
    });

    console.log('NeRF model loaded:', model);

    if (!useLocation) {
      // If not using geolocation, center it manually
      nerfLoader.setPosition(0, 0, 0);
    }

  } catch (error) {
    console.error('Failed to load NeRF model:', error);
  }
}

// Expose loading function to window for manual testing
(window as any).loadTestNeRF = loadTestNeRF;

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  controls.update();
  renderer.render(scene, camera);
}

animate();

console.log('MemoryBlocks initialized - Stage 4 complete: Geospatial positioning ready');
console.log('To test:');
console.log('  - loadTestNeRF(0) - Load first scene at origin');
console.log('  - loadTestNeRF(1) - Load second scene with offset');
console.log('  - loadTestNeRF(0, false) - Load without geolocation');

// Expose to window for testing
(window as any).platformEnvironment = platformEnvironment;
(window as any).nerfLoader = nerfLoader;
(window as any).scene = scene;
