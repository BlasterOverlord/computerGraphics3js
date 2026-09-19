/**
 * controls.js
 * Comprehensive user interaction manager:
 *   - Keyboard: Arrow keys & WASD orbit camera smoothly around the truck
 *   - Keyboard: Keys 1, 2, 3 toggle camera view presets
 *   - Keyboard: Key M toggles highway background audio
 *   - Mouse: Moving mouse horizontally/vertically rotates the sun position
 *            around the truck and updates real-time soft shadows.
 */

import * as THREE from 'three';
import { soundManager } from './audio.js';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export class Controls {
  constructor(camera, sunLight, sunMesh, sunDirection, skyMat, domElement) {
    this.camera       = camera;
    this.sunLight     = sunLight;
    this.sunMesh      = sunMesh;
    this.sunDirection = sunDirection;
    this.skyMat       = skyMat;
    this.domElement   = domElement;

    // ── Spherical Camera Orbit State ────────────────────────────────────────
    this.theta  = 0.04;   // Cinematic chase angle directly behind truck in left lane
    this.phi    = 0.26;   // Elevation angle (radians)
    this.radius = 14.5;   // Distance from truck center

    this.targetTheta  = this.theta;
    this.targetPhi    = this.phi;
    this.targetRadius = this.radius;

    this.phiMin    = 0.08;
    this.phiMax    = 1.35;
    this.radiusMin = 5.0;
    this.radiusMax = 38.0;

    this.smoothFactor = 0.08;

    // ── Sun Light Orbit State ───────────────────────────────────────────────
    // Initial sun placed ahead in the sky along -Z so it is visible over the highway
    this.sunAngleX    = 0.72; // Azimuth angle mapped to mouse X
    this.sunElevation = 0.28; // Golden hour elevation mapped to mouse Y
    this.sunOrbitRadius = 85.0;

    // ── Input State ─────────────────────────────────────────────────────────
    this.keys = {};

    this._onKeyDown   = this._onKeyDown.bind(this);
    this._onKeyUp     = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onWheel     = this._onWheel.bind(this);

    window.addEventListener('keydown',   this._onKeyDown);
    window.addEventListener('keyup',     this._onKeyUp);
    window.addEventListener('wheel',     this._onWheel, { passive: true });
    window.addEventListener('mousemove', this._onMouseMove);
  }

  // ── Camera Presets ────────────────────────────────────────────────────────
  setPreset(index) {
    if (index === 1) {
      // Cinematic Chase View: Aligned directly in the truck lane, clear view ahead
      this.targetTheta  = 0.04;
      this.targetPhi    = 0.26;
      this.targetRadius = 14.0;
    } else if (index === 2) {
      // Side Profile View: Above guardrail, viewing truck's full right side
      this.targetTheta  = Math.PI * 0.50;
      this.targetPhi    = 0.22;
      this.targetRadius = 13.5;
    } else if (index === 3) {
      // Front Low-Angle Highway View: Facing oncoming traffic and truck cab
      this.targetTheta  = Math.PI * 0.96;
      this.targetPhi    = 0.18;
      this.targetRadius = 16.0;
    }
  }

  // ── Event Handlers ────────────────────────────────────────────────────────
  _onKeyDown(e) {
    this.keys[e.code] = true;

    // Camera preset hotkeys
    if (e.code === 'Digit1') this.setPreset(1);
    if (e.code === 'Digit2') this.setPreset(2);
    if (e.code === 'Digit3') this.setPreset(3);

    // Audio toggle hotkey
    if (e.code === 'KeyM') {
      soundManager.toggle();
    }
  }

  _onKeyUp(e) {
    this.keys[e.code] = false;
  }

  _onMouseMove(e) {
    // Mouse X sweeps sun across the forward highway horizon
    const normX = e.clientX / window.innerWidth;
    this.sunAngleX = 0.60 + normX * 0.28; // ranges across forward sky
    // Mouse Y controls sun height
    this.sunElevation = 0.12 + (1.0 - e.clientY / window.innerHeight) * 0.45;
  }

  _onWheel(e) {
    this.targetRadius += e.deltaY * 0.015;
    this.targetRadius = Math.max(this.radiusMin, Math.min(this.radiusMax, this.targetRadius));
  }

  // ── Per-Frame Update ──────────────────────────────────────────────────────
  update(targetPos) {
    const ROTATE_SPEED = 0.03;
    const ZOOM_SPEED   = 0.25;

    // 1. Process Keyboard Controls
    if (this.keys['ArrowLeft']  || this.keys['KeyA']) this.targetTheta -= ROTATE_SPEED;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) this.targetTheta += ROTATE_SPEED;
    if (this.keys['ArrowUp']    || this.keys['KeyW']) this.targetPhi   -= ROTATE_SPEED;
    if (this.keys['ArrowDown']  || this.keys['KeyS']) this.targetPhi   += ROTATE_SPEED;
    if (this.keys['Equal']      || this.keys['NumpadAdd'])      this.targetRadius -= ZOOM_SPEED;
    if (this.keys['Minus']      || this.keys['NumpadSubtract']) this.targetRadius += ZOOM_SPEED;

    this.targetPhi    = Math.max(this.phiMin,    Math.min(this.phiMax,    this.targetPhi));
    this.targetRadius = Math.max(this.radiusMin, Math.min(this.radiusMax, this.targetRadius));

    // 2. Smooth Lerp Camera Orbit
    this.theta  = lerp(this.theta,  this.targetTheta,  this.smoothFactor);
    this.phi    = lerp(this.phi,    this.targetPhi,    this.smoothFactor);
    this.radius = lerp(this.radius, this.targetRadius, this.smoothFactor);

    const sinPhi = Math.sin(this.phi);
    const cosPhi = Math.cos(this.phi);

    this.camera.position.set(
      targetPos.x + this.radius * Math.sin(this.theta) * cosPhi,
      targetPos.y + this.radius * sinPhi,
      targetPos.z + this.radius * Math.cos(this.theta) * cosPhi
    );
    this.camera.lookAt(targetPos);

    // 3. Mouse Interaction: Light Position Rotates Around Truck
    const lightAzimuth = this.sunAngleX * Math.PI * 2.0;
    const lightElev    = this.sunElevation * Math.PI * 0.45;

    const lx = targetPos.x + Math.cos(lightAzimuth) * Math.cos(lightElev) * this.sunOrbitRadius;
    const ly = Math.max(8.0, Math.sin(lightElev) * this.sunOrbitRadius);
    const lz = targetPos.z + Math.sin(lightAzimuth) * Math.cos(lightElev) * this.sunOrbitRadius;

    this.sunLight.position.set(lx, ly, lz);
    this.sunLight.target.position.copy(targetPos);

    // Update Normalized Sun Direction for Sky & Sun Mesh
    const dir = new THREE.Vector3(lx - targetPos.x, ly, lz - targetPos.z).normalize();
    this.sunDirection.copy(dir);

    if (this.skyMat && this.skyMat.uniforms && this.skyMat.uniforms.uSunDirection) {
      this.skyMat.uniforms.uSunDirection.value.copy(dir);
    }

    if (this.sunMesh) {
      this.sunMesh.position.copy(dir).multiplyScalar(220);
    }
  }

  dispose() {
    window.removeEventListener('keydown',   this._onKeyDown);
    window.removeEventListener('keyup',     this._onKeyUp);
    window.removeEventListener('wheel',     this._onWheel);
    window.removeEventListener('mousemove', this._onMouseMove);
  }
}
