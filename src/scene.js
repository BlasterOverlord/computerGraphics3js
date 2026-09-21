/**
 * scene.js
 * Builds and manages the complete 2-lane highway environment:
 *   - Atmospheric Sky Dome with glowing sun and real-time custom GLSL shader
 *   - Seamless 3-segment looping infinite 2-lane highway (NEVER ends!)
 *   - Custom GLSL asphalt road shader with Blinn-Phong specular sheen
 *   - Highway guardrails and cat's-eye lane reflectors
 *   - Sleek curved highway streetlights with warm downward illumination
 *   - Lush roadside terrain and scenic trees
 *   - Two-way traffic fleet (Ferrari, Milk Truck, Minivan, Pickup) using DRACOLoader
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import {
  skyVertexShader,
  skyFragmentShader,
  asphaltVertexShader,
  asphaltFragmentShader,
} from './shaders.js';
import { createRoadTexture, createFieldTexture } from './textures.js';

// ─────────────────────────────────────────────────────────────────────────────
// Highway Dimensions & Constants
// ─────────────────────────────────────────────────────────────────────────────
const SEGMENT_LENGTH = 140; // Length of each road block
const NUM_SEGMENTS   = 3;   // Total 3 segments = 420 units continuous loop
const ROAD_WIDTH     = 10.5;
const LANE_OFFSET    = 2.7; // Right lane = +2.7, Left lane = -2.7

// Textures
const texRoad  = createRoadTexture();
const texField = createFieldTexture();

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Create a sleek, smoothly connected highway streetlight
// ─────────────────────────────────────────────────────────────────────────────
function makeStreetlight(isRightSide = true) {
  const group = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x55606A, metalness: 0.85, roughness: 0.25 });
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xFFF2C0 });

  // Main vertical mast
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 7.5, 12), poleMat);
  pole.position.y = 3.75;
  pole.castShadow = true;
  group.add(pole);

  // Smooth curved arm over the road
  const armCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 7.5, 0),
    new THREE.Vector3(isRightSide ? -1.0 : 1.0, 8.8, 0),
    new THREE.Vector3(isRightSide ? -2.4 : 2.4, 8.2, 0)
  );
  const armGeo = new THREE.TubeGeometry(armCurve, 12, 0.08, 8, false);
  const arm = new THREE.Mesh(armGeo, poleMat);
  arm.castShadow = true;
  group.add(arm);

  // Lamp fixture housing
  const headGeo = new THREE.BoxGeometry(0.75, 0.16, 0.35);
  const lampHead = new THREE.Mesh(headGeo, poleMat);
  lampHead.position.set(isRightSide ? -2.4 : 2.4, 8.2, 0);
  group.add(lampHead);

  // Glowing light lens
  const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.26), lampMat);
  bulb.position.set(isRightSide ? -2.4 : 2.4, 8.12, 0);
  group.add(bulb);

  // Warm downward streetlight cone
  const light = new THREE.PointLight(0xFFE8A8, 1.4, 22, 1.4);
  light.position.set(isRightSide ? -2.4 : 2.4, 7.9, 0);
  group.add(light);

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Create metallic W-beam highway guardrail
// ─────────────────────────────────────────────────────────────────────────────
function makeGuardrail(length = SEGMENT_LENGTH) {
  const group = new THREE.Group();
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xC0C8D0, metalness: 0.9, roughness: 0.25 });

  // Continuous rail beam
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, length), metalMat);
  rail.position.y = 0.72;
  rail.castShadow = true;
  rail.receiveShadow = true;
  group.add(rail);

  // Support posts
  const postGeo = new THREE.BoxGeometry(0.12, 0.85, 0.12);
  const numPosts = Math.floor(length / 5);
  for (let i = 0; i <= numPosts; i++) {
    const post = new THREE.Mesh(postGeo, metalMat);
    post.position.set(0, 0.42, -length / 2 + i * 5);
    post.castShadow = true;
    group.add(post);

    // Reflective cat's eye
    const refMat = new THREE.MeshBasicMaterial({ color: 0xFFC000 });
    const reflector = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.06), refMat);
    reflector.position.set(0, 0.74, -length / 2 + i * 5);
    group.add(reflector);
  }

  return group;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build Scene Environment
// ─────────────────────────────────────────────────────────────────────────────
export async function buildScene(scene, sunLight) {
  // Set up GLTFLoader with DRACOLoader
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  // ── 1. Atmospheric Sky Dome (GLSL Custom Shader) ──────────────────────────
  // Position sun slightly ahead on the right so it is visible in default camera view
  const sunDirection = new THREE.Vector3(0.35, 0.28, -0.89).normalize();

  const skyGeo = new THREE.SphereGeometry(280, 32, 16);
  const skyMat = new THREE.ShaderMaterial({
    vertexShader:   skyVertexShader,
    fragmentShader: skyFragmentShader,
    uniforms: {
      uSunDirection: { value: sunDirection },
      uTime: { value: 0 },
    },
    side:       THREE.BackSide,
    depthWrite: false,
    fog:        false,
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyDome);

  // Visible glowing sun disc in the sky
  const sunMat  = new THREE.MeshBasicMaterial({ color: 0xFFF6B8 });
  const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(7.0, 24, 24), sunMat);
  sunMesh.position.copy(sunDirection).multiplyScalar(240);
  scene.add(sunMesh);

  // ── 2. Shared Road Shader Material ────────────────────────────────────────
  const roadShaderMat = new THREE.ShaderMaterial({
    vertexShader:   asphaltVertexShader,
    fragmentShader: asphaltFragmentShader,
    uniforms: {
      uRoadTexture:    { value: texRoad },
      uSunPosition:    { value: sunLight.position },
      uSunColor:       { value: new THREE.Color(1.0, 0.88, 0.6) },
      uAmbientColor:   { value: new THREE.Color(0.25, 0.2, 0.25) },
      uCameraPosition: { value: new THREE.Vector3(0, 5, 10) },
      uSunIntensity:   { value: 1.5 },
    },
  });

  // ── 3. Modular Infinite Road Segments ─────────────────────────────────────
  const roadSegments = [];
  const roadGroup    = new THREE.Group();
  scene.add(roadGroup);

  for (let s = 0; s < NUM_SEGMENTS; s++) {
    const segment = new THREE.Group();
    const segZ = -SEGMENT_LENGTH * s;
    segment.position.z = segZ;

    // Asphalt road surface
    const roadPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(ROAD_WIDTH, SEGMENT_LENGTH, 1, 1),
      roadShaderMat
    );
    roadPlane.rotation.x = -Math.PI / 2;
    roadPlane.receiveShadow = true;
    segment.add(roadPlane);

    // Double yellow center divider lines
    const yellowMat    = new THREE.MeshBasicMaterial({ color: 0xFFBC00 });
    const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xFAFAFA });

    [-0.14, 0.14].forEach(yOffset => {
      const yellowLine = new THREE.Mesh(
        new THREE.PlaneGeometry(0.12, SEGMENT_LENGTH),
        yellowMat
      );
      yellowLine.rotation.x = -Math.PI / 2;
      yellowLine.position.set(yOffset, 0.018, 0);
      segment.add(yellowLine);
    });

    // Solid white edge lines
    [-ROAD_WIDTH / 2 + 0.45, ROAD_WIDTH / 2 - 0.45].forEach(xLine => {
      const shoulderLine = new THREE.Mesh(
        new THREE.PlaneGeometry(0.16, SEGMENT_LENGTH),
        whiteLineMat
      );
      shoulderLine.rotation.x = -Math.PI / 2;
      shoulderLine.position.set(xLine, 0.018, 0);
      segment.add(shoulderLine);
    });

    // Paved gravel shoulders
    const gravelMat = new THREE.MeshStandardMaterial({ color: 0x3A322C, roughness: 0.95 });
    [-1, 1].forEach(side => {
      const shoulder = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, SEGMENT_LENGTH),
        gravelMat
      );
      shoulder.rotation.x = -Math.PI / 2;
      shoulder.position.set(side * (ROAD_WIDTH / 2 + 0.9), 0.008, 0);
      shoulder.receiveShadow = true;
      segment.add(shoulder);
    });

    // Textured green roadside terrain
    const fieldMat = new THREE.MeshStandardMaterial({ map: texField, roughness: 0.95 });
    [-1, 1].forEach(side => {
      const terrain = new THREE.Mesh(
        new THREE.PlaneGeometry(120, SEGMENT_LENGTH),
        fieldMat
      );
      terrain.rotation.x = -Math.PI / 2;
      terrain.position.set(side * (ROAD_WIDTH / 2 + 1.8 + 60), 0.0, 0);
      terrain.receiveShadow = true;
      segment.add(terrain);
    });

    // Highway Guardrails
    [-ROAD_WIDTH / 2 - 0.75, ROAD_WIDTH / 2 + 0.75].forEach(rx => {
      const guardrail = makeGuardrail(SEGMENT_LENGTH);
      guardrail.position.set(rx, 0, 0);
      segment.add(guardrail);
    });

    // Curved Highway Streetlights along shoulders (every 35 units)
    for (let lz = -SEGMENT_LENGTH / 2 + 17; lz < SEGMENT_LENGTH / 2; lz += 35) {
      const rightLight = makeStreetlight(true);
      rightLight.position.set(ROAD_WIDTH / 2 + 1.6, 0, lz);
      segment.add(rightLight);

      const leftLight = makeStreetlight(false);
      leftLight.position.set(-ROAD_WIDTH / 2 - 1.6, 0, lz + 17.5);
      segment.add(leftLight);
    }

    roadGroup.add(segment);
    roadSegments.push(segment);
  }

  // ── 4. Roadside Trees (tree.glb) ──────────────────────────────────────────
  const roadsideTrees = [];
  try {
    const treeGltf = await new Promise((res, rej) => {
      loader.load('/models/tree.glb', res, undefined, rej);
    });

    const baseTree = treeGltf.scene;
    baseTree.traverse((c) => {
      if (c.isMesh) {
        c.castShadow = true;
        c.receiveShadow = true;
      }
    });

    const treeBox = new THREE.Box3().setFromObject(baseTree);
    const treeH = treeBox.getSize(new THREE.Vector3()).y;
    const treeScale = 8.5 / treeH;
    baseTree.scale.setScalar(treeScale);

    for (let i = 0; i < 30; i++) {
      const tree = baseTree.clone();
      const isRight = i % 2 === 0;
      const tx = isRight ? (ROAD_WIDTH / 2 + 5.0 + Math.random() * 12) : (-ROAD_WIDTH / 2 - 5.0 - Math.random() * 12);
      const tz = -220 + i * 14 + Math.random() * 7;
      tree.position.set(tx, 0, tz);
      tree.rotation.y = Math.random() * Math.PI * 2;
      const s = 0.8 + Math.random() * 0.5;
      tree.scale.multiplyScalar(s);
      scene.add(tree);
      roadsideTrees.push(tree);
    }
  } catch (err) {
    console.warn('Could not load tree.glb:', err);
  }

  // ── 5. Traffic Fleet with DRACO Support ────────────────────────────────────
  const trafficVehicles = [];

  async function loadTrafficCar(url, targetLength) {
    try {
      const gltf = await new Promise((res, rej) => loader.load(url, res, undefined, rej));
      const model = gltf.scene;

      model.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
        }
      });

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const s = targetLength / Math.max(size.x, size.z);
      model.scale.setScalar(s);

      // Center model exactly on (0, 0) in X and Z, and rest on road at Y = 0
      box.setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.x -= center.x;
      model.position.y = -box.min.y;
      model.position.z -= center.z;

      return model;
    } catch (e) {
      console.warn('Failed to load traffic model ' + url, e);
      return null;
    }
  }

  const [ferrariModel, milkTruckModel, minivanModel, pickupModel] = await Promise.all([
    loadTrafficCar('/models/ferrari.glb', 4.5),
    loadTrafficCar('/models/CesiumMilkTruck.glb', 4.6),
    loadTrafficCar('/models/car3_minivan.glb', 4.2),
    loadTrafficCar('/models/car1_truck.glb', 4.3),
  ]);

  // Traffic layout:
  // ONCOMING CARS in the RIGHT lane (+LANE_OFFSET)
  // Truck is in the LEFT lane (-LANE_OFFSET)
  const trafficDefs = [
    { model: ferrariModel,   lane: LANE_OFFSET, z: -70,  speed: 1.2, rotationY: Math.PI },
    { model: milkTruckModel, lane: LANE_OFFSET, z: -150, speed: 0.9, rotationY: 0 },
    { model: minivanModel,   lane: LANE_OFFSET, z: -230, speed: 1.0, rotationY: 0 },
    { model: pickupModel,    lane: LANE_OFFSET, z: -310, speed: 1.1, rotationY: 0 },
  ];

  trafficDefs.forEach(def => {
    if (!def.model) return;
    const carGroup = new THREE.Group();
    const carMesh = def.model.clone();

    // Orient vehicle so it faces forward along the oncoming travel direction (+Z)
    carMesh.rotation.y = def.rotationY;
    carMesh.updateMatrixWorld(true);

    const carBox = new THREE.Box3().setFromObject(carMesh);
    const carSize = carBox.getSize(new THREE.Vector3());
    const frontZ = carBox.max.z; // Front bumper faces +Z towards oncoming view
    const hlY = carBox.min.y + carSize.y * 0.35;
    const hlX = carSize.x * 0.32;

    // Oncoming headlights precisely aligned on the front bumper
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xFFFFAA });
    const hlLeft = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), hlMat);
    hlLeft.position.set(-hlX, hlY, frontZ);
    const hlRight = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), hlMat);
    hlRight.position.set(hlX, hlY, frontZ);
    carGroup.add(hlLeft);
    carGroup.add(hlRight);

    // Forward headlight spotlight towards +Z
    const spot = new THREE.SpotLight(0xFFF8C0, 2.2, 40, Math.PI / 4, 0.4);
    spot.position.set(0, hlY, frontZ);
    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 0, frontZ + 25);
    carGroup.add(spot);
    carGroup.add(spotTarget);
    spot.target = spotTarget;

    carGroup.add(carMesh);
    carGroup.position.set(def.lane, 0, def.z);
    scene.add(carGroup);

    trafficVehicles.push({
      group:      carGroup,
      speed:      def.speed,
    });
  });

  // ── 6. Per-Frame Update Function ──────────────────────────────────────────
  function update(delta, highwaySpeed = 1.0, camera) {
    skyMat.uniforms.uTime.value += delta;
    // Slower, more relaxing cruising highway speed
    const driveDelta = highwaySpeed * delta * 14.0;

    // 1. Move road segments along +Z (truck driving forward illusion)
    for (let i = 0; i < roadSegments.length; i++) {
      const seg = roadSegments[i];
      seg.position.z += driveDelta;

      if (seg.position.z > SEGMENT_LENGTH) {
        seg.position.z -= SEGMENT_LENGTH * NUM_SEGMENTS;
      }
    }

    // 2. Move & wrap roadside trees
    for (let i = 0; i < roadsideTrees.length; i++) {
      const tree = roadsideTrees[i];
      tree.position.z += driveDelta;
      if (tree.position.z > 35) {
        tree.position.z -= 320;
      }
    }

    // 3. Move & wrap oncoming traffic vehicles (all in right lane)
    for (let i = 0; i < trafficVehicles.length; i++) {
      const v = trafficVehicles[i];
      v.group.position.z += driveDelta + v.speed * delta * 14.0;
      if (v.group.position.z > 50) {
        v.group.position.z = -260 - Math.random() * 60;
      }
    }

    // 4. Update road shader uniforms
    if (camera) {
      roadShaderMat.uniforms.uCameraPosition.value.copy(camera.position);
    }
  }

  return {
    sunMesh,
    sunDirection,
    update,
  };
}
