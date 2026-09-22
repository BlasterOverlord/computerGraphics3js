/**
 * Locally hosted, seamless CC0 surface textures used by the environment.
 * Source and author details live in public/textures/ATTRIBUTION.md.
 */

import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

function loadTiledColorTexture(path, repeatX, repeatY) {
  const texture = textureLoader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = 8;
  return texture;
}

export function loadEnvironmentTextures() {
  return {
    road: loadTiledColorTexture('/textures/asphalt-floor-diffuse.jpg', 4.5, 60),
    terrain: loadTiledColorTexture('/textures/grass-ground-diffuse.jpg', 48, 56),
    gravel: loadTiledColorTexture('/textures/gravel-stones-diffuse.jpg', 1, 70),
    guardrailBeam: loadTiledColorTexture('/textures/weathered-metal-diffuse.jpg', 1, 12),
    guardrailPost: loadTiledColorTexture('/textures/weathered-metal-diffuse.jpg', 1, 2),
    streetlightPole: loadTiledColorTexture('/textures/weathered-metal-diffuse.jpg', 2, 8),
    streetlightFixture: loadTiledColorTexture('/textures/weathered-metal-diffuse.jpg', 2, 1),
  };
}
