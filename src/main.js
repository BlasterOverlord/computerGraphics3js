/**
 * main.js
 * Master orchestrator for the Bangladeshi Truck 2-Lane Highway Scene.
 * Fulfills all project requirements:
 *   1. Custom shaders (Atmospheric sky shader + Blinn-Phong asphalt shader)
 *   2. Implementation of lighting (Directional sun, ambient, hemisphere, streetlights, headlights)
 *   3. Perspective projection (PerspectiveCamera with 60 deg FOV)
 *   4. Texture for each object (Authentic truck, wheels, asphalt, guardrails, trees)
 *   5. Animation (Wheels rotate, continuous highway traffic, infinite road scroll)
 *   6. Mouse and keyboard interaction:
 *      - Keyboard: Camera moves around the truck
 *      - Mouse: Light position rotates around the truck
 */

import * as THREE from 'three';
import { loadTruck }   from './truck.js';
import { buildScene }   from './scene.js';
import { Controls }     from './controls.js';
import { soundManager } from './audio.js';

async function init() {
  const container = document.getElementById('canvas-container');
  const loadingEl = document.getElementById('loading');

  // ── 1. WebGL Renderer ─────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.toneMapping       = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // ── 2. Scene & Atmospheric Fog ────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.fog   = new THREE.FogExp2(0xE07028, 0.0035); // Warm sunset golden fog

  // ── 3. Perspective Projection Camera ──────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(
    60,                                     // FOV (Perspective projection requirement)
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1,                                    // Near clipping plane
    1000                                    // Far clipping plane
  );
  camera.position.set(4, 4, 16);

  // ── 4. Lighting System ────────────────────────────────────────────────────
  // Main Directional Sun Light (Position controlled by mouse interaction)
  const sunLight = new THREE.DirectionalLight(0xFFE2A0, 2.2);
  sunLight.position.set(25, 30, -35);
  sunLight.castShadow            = true;
  sunLight.shadow.mapSize.width  = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near    = 1.0;
  sunLight.shadow.camera.far     = 180;
  sunLight.shadow.camera.left    = -25;
  sunLight.shadow.camera.right   =  25;
  sunLight.shadow.camera.top     =  25;
  sunLight.shadow.camera.bottom  = -25;
  sunLight.shadow.bias           = -0.0008;
  scene.add(sunLight);
  scene.add(sunLight.target);

  // Ambient Fill Light (Sunset twilight purple-amber)
  const ambientLight = new THREE.AmbientLight(0xFFC088, 0.45);
  scene.add(ambientLight);

  // Hemisphere Sky-to-Ground Bounce Light
  const hemiLight = new THREE.HemisphereLight(0xFFA060, 0x2A4518, 0.55);
  scene.add(hemiLight);

  // ── 5. Build Environment Scene ────────────────────────────────────────────
  const { sunMesh, sunDirection, skyMat, update: updateScene } = await buildScene(scene, sunLight);

  // ── 6. Load Authentic Bangladeshi Truck Model ─────────────────────────────
  const truck = await loadTruck();
  scene.add(truck.truckGroup);

  // Target point the camera orbits around (truck center in left lane)
  const truckCenter = new THREE.Vector3(-2.65, 1.8, 0);

  // ── 7. Controls System (Keyboard Orbit + Mouse Sun Rotation) ──────────────
  const controls = new Controls(
    camera,
    sunLight,
    sunMesh,
    sunDirection,
    skyMat,
    renderer.domElement
  );

  // ── 8. UI Button Wiring ───────────────────────────────────────────────────
  const btnSound = document.getElementById('btn-sound');
  function updateSoundUI(isPlaying) {
    if (btnSound) {
      btnSound.textContent = isPlaying ? '🔊 Sound: ON' : '🔇 Sound: OFF';
      btnSound.style.background = isPlaying ? 'rgba(46, 125, 50, 0.35)' : 'rgba(255, 120, 60, 0.2)';
      btnSound.style.borderColor = isPlaying ? 'rgba(129, 199, 132, 0.7)' : 'rgba(255, 140, 80, 0.5)';
    }
  }

  soundManager.addListener(updateSoundUI);

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      soundManager.toggle();
    });
  }

  const btnPreset1 = document.getElementById('btn-view-1');
  const btnPreset2 = document.getElementById('btn-view-2');
  const btnPreset3 = document.getElementById('btn-view-3');

  if (btnPreset1) btnPreset1.addEventListener('click', () => controls.setPreset(1));
  if (btnPreset2) btnPreset2.addEventListener('click', () => controls.setPreset(2));
  if (btnPreset3) btnPreset3.addEventListener('click', () => controls.setPreset(3));

  // Hide loading overlay
  if (loadingEl) {
    loadingEl.style.opacity = '0';
    setTimeout(() => { loadingEl.style.display = 'none'; }, 500);
  }

  // ── 9. Animation Loop ─────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  const HIGHWAY_SPEED = 1.0;

  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1);

    // 1. Animate Truck Wheels (Rotates wheels requirement)
    truck.update(delta, HIGHWAY_SPEED);

    // 2. Animate Endless Highway & Traffic Flow
    updateScene(delta, HIGHWAY_SPEED, camera);

    // 3. Update Camera Orbit & Mouse-Controlled Sun Position
    controls.update(truckCenter);

    // 4. Render Scene
    renderer.render(scene, camera);
  }

  animate();

  // ── 10. Window Resize Handler ─────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}

init().catch((err) => {
  console.error('Fatal initialization error:', err);
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.innerHTML = `<div style="color:#ff6b6b;font-weight:bold;padding:20px;background:rgba(0,0,0,0.8);border-radius:10px;">Failed to load scene: ${err.message}</div>`;
  }
});
