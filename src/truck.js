/**
 * truck.js
 * Loads and configures the authentic Bangladeshi 3D truck model (truck.glb).
 * Identifies wheel nodes for realistic forward rotation, enables shadows,
 * adds functioning headlights and taillights, and positions the truck
 * facing forward (-Z) in the left lane of the 2-lane highway.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export async function loadTruck() {
  const loader = new GLTFLoader();

  const gltf = await new Promise((resolve, reject) => {
    loader.load(
      '/models/truck.glb',
      resolve,
      undefined,
      reject
    );
  });

  const truckModel = gltf.scene;
  const wheels = [];

  // Enable shadows and find wheel nodes
  truckModel.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      // Enhance material settings
      if (child.material) {
        child.material.roughness = Math.min(child.material.roughness || 0.6, 0.7);
        child.material.metalness = Math.max(child.material.metalness || 0.1, 0.2);
        child.material.needsUpdate = true;
      }
    }

    // Collect wheel nodes for wheel spin animation (only genuine wheel pivots)
    const name = (child.name || '').toLowerCase();
    if (name === 'tire' || name === 'back_tire' || name === 'back tire') {
      wheels.push(child);
    }
  });

  // Calculate bounding box to normalize scale
  let box = new THREE.Box3().setFromObject(truckModel);
  let size = box.getSize(new THREE.Vector3());

  // Target truck length along Z is ~6.8 units
  const maxDim = Math.max(size.x, size.z);
  const scale = 6.8 / maxDim;
  truckModel.scale.setScalar(scale);

  // Rotate truck 180 degrees (Math.PI) so cab faces forward (-Z direction down the highway)
  truckModel.rotation.y = Math.PI;
  truckModel.updateMatrixWorld(true);

  // Recalculate box after scaling and rotation to center properly
  box = new THREE.Box3().setFromObject(truckModel);
  size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Center horizontally & sit wheels on road (y = 0)
  truckModel.position.x = -center.x;
  truckModel.position.y = -box.min.y;
  truckModel.position.z = -center.z;

  // Master container group for the truck
  const truckGroup = new THREE.Group();
  truckGroup.add(truckModel);

  // ── Headlights (Warm forward spotlights & glowing lenses on cab) ─────────
  const headlightColor = 0xFFF2A8;
  const headlightIntensity = 3.5;
  const headlightDistance = 50;

  const leftLight = new THREE.SpotLight(headlightColor, headlightIntensity, headlightDistance, Math.PI / 5, 0.35, 1.2);
  const rightLight = new THREE.SpotLight(headlightColor, headlightIntensity, headlightDistance, Math.PI / 5, 0.35, 1.2);

  // Cab is at forward -Z
  const hlY = size.y * 0.35;
  const hlZ = -size.z * 0.48;
  const hlX = size.x * 0.32;

  leftLight.position.set(-hlX, hlY, hlZ);
  rightLight.position.set(hlX, hlY, hlZ);

  // Target points ahead on the road (-Z direction)
  const leftTarget = new THREE.Object3D();
  leftTarget.position.set(-hlX, 0, hlZ - 25);
  const rightTarget = new THREE.Object3D();
  rightTarget.position.set(hlX, 0, hlZ - 25);

  truckGroup.add(leftLight);
  truckGroup.add(rightLight);
  truckGroup.add(leftTarget);
  truckGroup.add(rightTarget);

  leftLight.target = leftTarget;
  rightLight.target = rightTarget;

  // Emissive glowing headlight discs on front cab bumper
  const lensMat = new THREE.MeshBasicMaterial({ color: 0xFFFFCC });
  const lensGeo = new THREE.SphereGeometry(0.16, 12, 12);
  const leftLens = new THREE.Mesh(lensGeo, lensMat);
  leftLens.position.set(-hlX, hlY, hlZ);
  const rightLens = new THREE.Mesh(lensGeo, lensMat);
  rightLens.position.set(hlX, hlY, hlZ);
  truckGroup.add(leftLens);
  truckGroup.add(rightLens);

  // ── Red Taillights (Rear of truck bed facing +Z) ─────────────────────────
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xFF1100 });
  const tailGeo = new THREE.BoxGeometry(0.2, 0.16, 0.08);
  const tlZ = size.z * 0.49;
  const tlY = size.y * 0.32;
  const leftTail = new THREE.Mesh(tailGeo, tailMat);
  leftTail.position.set(-hlX * 0.9, tlY, tlZ);
  const rightTail = new THREE.Mesh(tailGeo, tailMat);
  rightTail.position.set(hlX * 0.9, tlY, tlZ);
  truckGroup.add(leftTail);
  truckGroup.add(rightTail);

  // ── Position Truck in the LEFT lane of the 2-lane highway ───────────────
  // Left lane center is at x = -2.65
  truckGroup.position.set(-2.65, 0, 0);

  // Animation update method
  function update(delta, speed = 1.0) {
    // Wheel spin animation around axle in forward direction
    // Rotated 180 deg around Y, +spinAngle rotates top of wheel forward towards -Z
    const spinAngle = speed * delta * 4.2;
    for (let i = 0; i < wheels.length; i++) {
      wheels[i].rotation.z += spinAngle;
    }

    // Subtle engine idle / road vibration
    truckModel.position.y = (-box.min.y) + Math.sin(Date.now() * 0.012) * 0.005;
    truckModel.rotation.z = Math.sin(Date.now() * 0.006) * 0.002;
  }

  return {
    truckGroup,
    truckModel,
    wheels,
    size,
    update,
  };
}
