import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.3));
const light = new THREE.DirectionalLight(0xffffff, 0.7);
light.position.set(5, 10, 3);
scene.add(light);

// Controls
const controls = new PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => controls.lock());
scene.add(controls.getObject());
camera.position.y = 1.6;

// Movement
const move = { forward: false, backward: false, left: false, right: false, up: false, down: false };
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
document.addEventListener('keydown', e => {
  switch (e.code) {
    case 'KeyW': move.forward = true; break;
    case 'KeyS': move.backward = true; break;
    case 'KeyA': move.left = true; break;
    case 'KeyD': move.right = true; break;
    case 'Space': move.up = true; break;
    case 'ShiftLeft': move.down = true; break;
  }
});
document.addEventListener('keyup', e => {
  switch (e.code) {
    case 'KeyW': move.forward = false; break;
    case 'KeyS': move.backward = false; break;
    case 'KeyA': move.left = false; break;
    case 'KeyD': move.right = false; break;
    case 'Space': move.up = false; break;
    case 'ShiftLeft': move.down = false; break;
  }
});

// Face directions for cube geometry
const faces = [
  { dir: [0, 0, 1], corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
  { dir: [0, 0, -1], corners: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]] },
  { dir: [1, 0, 0], corners: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]] },
  { dir: [-1, 0, 0], corners: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]] },
  { dir: [0, 1, 0], corners: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] },
  { dir: [0, -1, 0], corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
];

// === Chunk Class ===
class Chunk {
  constructor(chunkX, chunkZ) {
    this.chunkX = chunkX;
    this.chunkZ = chunkZ;
    this.slices = Array.from({ length: 8 }, () => new Set());
  }

  addBlock(x, y, z) {
    const slice = Math.floor(y / 16);
    if (slice < 0 || slice >= 8) return;
    this.slices[slice].add(`${x},${y},${z}`);
  }

  isOccupied(x, y, z) {
    const slice = Math.floor(y / 16);
    return this.slices[slice]?.has(`${x},${y},${z}`) || false;
  }

  buildSliceMesh(sliceIndex) {
    const slice = this.slices[sliceIndex];
    if (!slice || slice.size === 0) return null;

    const positions = [], normals = [], indices = [];
    let index = 0;

    for (const key of slice) {
      const [x, y, z] = key.split(',').map(Number);

      for (const { dir, corners } of faces) {
        const nx = x + dir[0];
        const ny = y + dir[1];
        const nz = z + dir[2];
        if (this.isOccupied(nx, ny, nz)) continue;

        for (const [dx, dy, dz] of corners) {
          positions.push(x + dx, y + dy, z + dz);
          normals.push(...dir);
        }

        indices.push(index, index + 1, index + 2, index, index + 2, index + 3);
        index += 4;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setIndex(indices);

    const material = new THREE.MeshStandardMaterial({ color: 0x66cc88 });
    return new THREE.Mesh(geometry, material);
  }

  buildMeshes() {
    return this.slices.map((_, i) => this.buildSliceMesh(i)).filter(Boolean);
  }
}

// === World Generation ===
const chunks = new Map();
function getChunkKey(x, z) {
  return `${x},${z}`;
}

function generateChunk(cx, cz) {
  const chunk = new Chunk(cx, cz);
  const baseX = cx * 16;
  const baseZ = cz * 16;

  for (let x = 0; x < 16; x++) {
    for (let z = 0; z < 16; z++) {
      const worldX = baseX + x;
      const worldZ = baseZ + z;
      const height = Math.floor(3 + Math.sin(worldX * 0.1) * 2 + Math.cos(worldZ * 0.1) * 2);
      for (let y = 0; y <= height; y++) {
        chunk.addBlock(worldX, y, worldZ);
      }
    }
  }

  chunks.set(getChunkKey(cx, cz), chunk);
  chunk.buildMeshes().forEach(mesh => scene.add(mesh));
}

// Generate multiple chunks
for (let cx = -5; cx <= 5; cx++) {
  for (let cz = -5; cz <= 5; cz++) {
    generateChunk(cx, cz);
  }
}

// === Animate ===
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  if (controls.isLocked) {
    direction.z = Number(move.forward) - Number(move.backward);
    direction.x = Number(move.right) - Number(move.left);
    direction.y = Number(move.up) - Number(move.down);
    direction.normalize();

    const delta = clock.getDelta();
    const speed = 20;
    velocity.x = direction.x * speed * delta;
    velocity.y = direction.y * speed * delta;
    velocity.z = direction.z * speed * delta;

    controls.moveRight(velocity.x);
    controls.moveForward(velocity.z);
    controls.getObject().position.y += velocity.y;
  }

  renderer.render(scene, camera);
}
animate();

// === Resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
