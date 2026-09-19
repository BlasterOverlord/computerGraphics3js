/**
 * textures.js
 * Generates procedural environment textures using the HTML5 Canvas 2D API:
 *   1. createRoadTexture()  - Asphalt road texture with subtle bitumen grain noise
 *   2. createFieldTexture() - Roadside agricultural/grass terrain with crop rows
 *
 * Each function returns a THREE.CanvasTexture configured with texture repeat wrapping.
 */

import * as THREE from 'three';

/** Helper to allocate an offscreen canvas and 2D context */
function makeCanvas(w, h) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext('2d') };
}

/**
 * Procedural asphalt surface texture with fine grain speckling.
 */
export function createRoadTexture() {
  const W = 512, H = 1024;
  const { canvas, ctx } = makeCanvas(W, H);

  // Asphalt base gradient (subtly lighter in the center to simulate tire wear)
  const roadGrad = ctx.createLinearGradient(0, 0, W, 0);
  roadGrad.addColorStop(0, '#242424');
  roadGrad.addColorStop(0.3, '#323232');
  roadGrad.addColorStop(0.5, '#383838');
  roadGrad.addColorStop(0.7, '#323232');
  roadGrad.addColorStop(1, '#242424');
  ctx.fillStyle = roadGrad;
  ctx.fillRect(0, 0, W, H);

  // Fine speckle noise for realistic asphalt grain texture
  for (let i = 0; i < 4000; i++) {
    const px = Math.random() * W;
    const py = Math.random() * H;
    const ps = Math.random() * 2.5 + 0.5;
    const brightness = Math.random() * 0.15;
    ctx.fillStyle = `rgba(${60 + brightness * 200}, ${60 + brightness * 180}, ${60 + brightness * 160}, 0.35)`;
    ctx.fillRect(px, py, ps, ps);
  }

  // Solid white shoulder edge lines
  ctx.fillStyle = '#DDDDDD';
  ctx.fillRect(10, 0, 10, H);
  ctx.fillRect(W - 20, 0, 10, H);

  // Center dashed yellow guidance line
  ctx.fillStyle = '#FFD700';
  let y = 0;
  while (y < H) {
    ctx.fillRect(W / 2 - 5, y, 10, 70);
    y += 120;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 6);
  return tex;
}

/**
 * Procedural agricultural terrain texture for roadside fields.
 */
export function createFieldTexture() {
  const W = 512, H = 512;
  const { canvas, ctx } = makeCanvas(W, H);

  // Golden-green gradient reflecting sunset illumination
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#C8A000');
  grad.addColorStop(0.3, '#8BC34A');
  grad.addColorStop(0.6, '#6DA030');
  grad.addColorStop(1, '#3A8C1A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle crop row lines
  ctx.strokeStyle = 'rgba(30, 70, 10, 0.3)';
  ctx.lineWidth = 2;
  for (let ly = 8; ly < H; ly += 12) {
    ctx.beginPath();
    ctx.moveTo(0, ly + (Math.random() - 0.5) * 3);
    ctx.lineTo(W, ly + (Math.random() - 0.5) * 3);
    ctx.stroke();
  }

  // Gentle wind variation patches
  for (let i = 0; i < 20; i++) {
    const px = Math.random() * W;
    const py = Math.random() * H;
    ctx.fillStyle = 'rgba(200, 200, 50, 0.06)';
    ctx.fillRect(px, py, 60 + Math.random() * 80, 6);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 8);
  return tex;
}
