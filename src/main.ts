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

// Initialize NeRF loader and scene manager
const nerfLoader = new NeRFLoader(scene);
const sceneManager = new SceneManager(nerfLoader);

// Initialize UI controls
const uiManager = new UIManager(sceneManager, platformEnvironment, nerfLoader, {
  title: 'MemoryBlocks Controls',
  width: 320,
  left: '20px',
  top: '20px'
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

console.log('MemoryBlocks initialized - Stage 6 complete: 3D UI controls active');
console.log('\n=== UI Controls ===');
console.log('Use the control panel on the left to:');
console.log('  - Navigate between scenes');
console.log('  - Adjust time of day');
console.log('  - Transform models (scale, offset)');
console.log('\n=== Console Commands ===');
console.log('  listScenes()     - Show all available scenes');
console.log('  loadScene(n)     - Load scene by index');
console.log('\nInteract with the UI panel to explore the narrative!\n');

// Expose to window for testing
(window as any).platformEnvironment = platformEnvironment;
(window as any).nerfLoader = nerfLoader;
(window as any).sceneManager = sceneManager;
(window as any).uiManager = uiManager;
(window as any).scene = scene;
