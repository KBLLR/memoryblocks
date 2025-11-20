import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PlatformEnvironment } from './PlatformEnvironment.js';

/**
 * MemoryBlocks - Stage 2: Platform Environment Integration
 * Core 3D environment with platform and dynamic sky
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

// Test content: Axes helper (for reference, can be removed later)
const axesHelper = new THREE.AxesHelper(20);
scene.add(axesHelper);

// Add a test sphere to verify shadows and lighting
const testGeometry = new THREE.SphereGeometry(3, 32, 32);
const testMaterial = new THREE.MeshStandardMaterial({
  color: 0x4488ff,
  roughness: 0.5,
  metalness: 0.2
});
const testSphere = new THREE.Mesh(testGeometry, testMaterial);
testSphere.position.set(0, 3, 0);
testSphere.castShadow = true;
testSphere.receiveShadow = true;
scene.add(testSphere);

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Slowly rotate test sphere
  testSphere.rotation.y += 0.005;

  controls.update();
  renderer.render(scene, camera);
}

animate();

console.log('MemoryBlocks initialized - Stage 2 complete: Platform environment ready');

// Expose to window for testing
(window as any).platformEnvironment = platformEnvironment;
(window as any).scene = scene;
