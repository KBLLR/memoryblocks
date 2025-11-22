import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PlatformEnvironment } from './PlatformEnvironment.js';
import { NeRFLoader } from './NeRFLoader.js';
import { SceneManager } from './SceneManager.js';
import { UIManager } from './UIManager.js';

/**
 * MemoryBlocks - Stage 6: 3D UI Integration
 * Interactive controls for scene navigation and environment tweaks
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
// Enable clipping for platform boundaries
renderer.localClippingEnabled = true;

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

// Platform configuration
const PLATFORM_SIZE = 60;
const PLATFORM_HEIGHT = 1.5;

// Initialize platform environment
const platformEnvironment = new PlatformEnvironment(scene, {
  size: PLATFORM_SIZE,
  height: PLATFORM_HEIGHT,
  color: 0x8b7355,
  roughness: 0.9
});

// Set initial time to afternoon for nice lighting
platformEnvironment.timeOfDay = 14; // 2 PM

// Initialize NeRF loader with platform constraints
const nerfLoader = new NeRFLoader(scene, {
  size: PLATFORM_SIZE,
  height: PLATFORM_HEIGHT,
  surfaceY: 0  // Platform top surface is at Y=0
});
const sceneManager = new SceneManager(nerfLoader);

// Initialize UI controls with camera and renderer for enhanced controls
const uiManager = new UIManager(sceneManager, platformEnvironment, nerfLoader, {
  title: 'MemoryBlocks Controls',
  left: '20px',
  top: '20px',
  camera: camera,
  renderer: renderer
});

/**
 * Helper functions (also available via UI)
 */
async function loadScene(indexOrId: number | string) {
  if (typeof indexOrId === 'number') {
    await sceneManager.loadSceneByIndex(indexOrId);
  } else {
    await sceneManager.loadSceneById(indexOrId);
  }
}

function listScenes() {
  const scenes = sceneManager.getAllScenes();
  console.log('\n=== Available Scenes ===');
  scenes.forEach((scene, index) => {
    console.log(`[${index}] ${scene.id}: ${scene.title}`);
    console.log(`    ${scene.description || 'No description'}`);
  });
  console.log(`\nTotal: ${scenes.length} scenes\n`);
}

// Expose helper functions to window
(window as any).loadScene = loadScene;
(window as any).listScenes = listScenes;

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

console.log('\n🎮 MemoryBlocks - Geospatial NeRF Viewer Initialized');
console.log('═══════════════════════════════════════════════════\n');
console.log('✅ Platform: 60x60m with dynamic sky');
console.log('✅ Clipping: Models constrained to platform boundaries');
console.log('✅ Positioning: All models sit on platform surface (Y=0)');
console.log('✅ UI: Interactive controls loaded');
console.log('\n📋 UI Controls (left panel):');
console.log('  • Scene selector dropdown - Choose from all available scenes');
console.log('  • Previous/Next buttons - Navigate sequentially');
console.log('  • Time slider - Adjust day/night cycle (0-24 hours)');
console.log('  • Model adjustments - Scale and vertical offset');
console.log('\n💻 Console Commands:');
console.log('  listScenes()     - Show all available scenes with details');
console.log('  loadScene(n)     - Load scene by index (0-based)');
console.log('  loadScene("id")  - Load scene by ID string');
console.log('\n📍 Scene list has been populated dynamically from scenes.ts');
console.log('   Check the UI dropdown or run listScenes() to see all scenes.\n');

// Expose to window for testing
(window as any).platformEnvironment = platformEnvironment;
(window as any).nerfLoader = nerfLoader;
(window as any).sceneManager = sceneManager;
(window as any).uiManager = uiManager;
(window as any).scene = scene;
