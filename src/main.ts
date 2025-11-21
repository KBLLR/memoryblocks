import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PlatformEnvironment } from './PlatformEnvironment.js';
import { NeRFLoader } from './NeRFLoader.js';
import { SceneManager } from './SceneManager.js';
import { InWorldGUIManager } from './InWorldGUIManager.js';
import { TimelineUI } from './TimelineUI.js';

/**
 * MemoryBlocks - Stage 8: Complete Interactive Experience
 * In-world 3D GUI panels + Timeline navigation + Dynamic header
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

// Initialize In-World 3D GUI
// These are interactive GUI panels rendered as textures on 3D planes at platform edges
const inWorldGUI = new InWorldGUIManager(
  scene,
  camera,
  renderer,
  platformEnvironment,
  {
    guiWidth: 128 * 8,
    guiHeight: 200,
    planeWidth: 60,
    planeHeight: 8,
    terrainPosition: new THREE.Vector3(0, 0.01, 30), // Front edge
    skyPosition: new THREE.Vector3(0, 0.01, -30), // Back edge
    enableInteraction: true,
  }
);

// Initialize Timeline UI
// Interactive timeline at the bottom for scene navigation
const timelineUI = new TimelineUI(sceneManager, {
  startYear: 2024,
  endYear: 2027,
  container: 'app'
});

// Update dynamic header based on scene
function updateHeader(sceneTitle: string, sceneDescription: string) {
  const titleEl = document.getElementById('header-title');
  const subtitleEl = document.getElementById('header-subtitle');
  if (titleEl) titleEl.textContent = sceneTitle;
  if (subtitleEl) subtitleEl.textContent = sceneDescription || 'Navigate through time and space';
}

/**
 * Helper functions (also available via UI)
 */
async function loadScene(indexOrId: number | string) {
  if (typeof indexOrId === 'number') {
    await sceneManager.loadSceneByIndex(indexOrId);
    timelineUI.updateTimelinePosition(indexOrId);
  } else {
    await sceneManager.loadSceneById(indexOrId);
    const index = sceneManager.getCurrentSceneIndex();
    if (index >= 0) {
      timelineUI.updateTimelinePosition(index);
    }
  }

  // Update header with current scene info
  const currentScene = sceneManager.getCurrentScene();
  if (currentScene) {
    updateHeader(currentScene.title, currentScene.description || 'A NeRF capture');
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

console.log('\n🎮 MemoryBlocks - Interactive Geospatial NeRF Viewer');
console.log('═════════════════════════════════════════════════════\n');
console.log('✅ Platform: 60x60m with dynamic sky and clipping');
console.log('✅ 3D GUI: In-world interactive panels at platform edges');
console.log('✅ Timeline: Bottom timeline for scene navigation (2024-2027)');
console.log('✅ Header: Dynamic header updates with scene information');
console.log('\n🎨 In-World GUI Panels (clickable):');
console.log('  • Front Panel (Z=+30) - Terrain controls');
console.log('    - Height, expo, movement (joystick), levels, frequency');
console.log('  • Back Panel (Z=-30) - Sky controls');
console.log('    - Cloud size, coverage, density, azimuth, time');
console.log('\n⏱️ Timeline Navigation:');
console.log('  • Click markers or track to jump between scenes');
console.log('  • Progress indicator shows current position');
console.log('  • Hover over markers to see scene titles');
console.log('\n💻 Console Commands:');
console.log('  listScenes()            - Show all available scenes with details');
console.log('  loadScene(n)            - Load scene by index (0-based)');
console.log('  loadScene("id")         - Load scene by ID string');
console.log('  inWorldGUI.setVisible() - Toggle 3D GUI visibility (true/false)');
console.log('\n📍 All ' + sceneManager.getSceneCount() + ' scenes loaded and ready to explore!\n');

// Expose to window for testing
(window as any).platformEnvironment = platformEnvironment;
(window as any).nerfLoader = nerfLoader;
(window as any).sceneManager = sceneManager;
(window as any).inWorldGUI = inWorldGUI;
(window as any).timelineUI = timelineUI;
(window as any).scene = scene;
