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

// Controls setup
const controls = new PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => controls.lock());
scene.add(controls.getObject());

camera.position.y = 1.6; // eye height

// Movement
const move = {
  forward: false, backward: false, 
  left: false, right: false, 
  up: false, down: false,
};
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW': move.forward = true; break;
    case 'KeyS': move.backward = true; break;
    case 'KeyA': move.left = true; break;
    case 'KeyD': move.right = true; break;
    case 'Space': move.up = true; break;
    case 'ShiftLeft': move.down = true; break;
  }
});
document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW': move.forward = false; break;
    case 'KeyS': move.backward = false; break;
    case 'KeyA': move.left = false; break;
    case 'KeyD': move.right = false; break;
    case 'Space': move.up = false; break;
    case 'ShiftLeft': move.down = false; break;
  }
});

// Voxel grid and visibility check
const size = 11;
const voxels = new Set();
for (let x = -5; x <= 5; x++) {
  for (let z = -5; z <= 5; z++) {
    voxels.add(`${x},0,${z}`);
  }
}

function isOccupied(x, y, z) {
  return voxels.has(`${x},${y},${z}`);
}

// Face directions and their vertex data
const faces = [
  { dir: [0, 0, 1], corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] }, // front
  { dir: [0, 0, -1], corners: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]] }, // back
  { dir: [1, 0, 0], corners: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]] }, // right
  { dir: [-1, 0, 0], corners: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]] }, // left
  { dir: [0, 1, 0], corners: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] }, // top
  { dir: [0, -1, 0], corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] }, // bottom
];

// Build visible faces into a single geometry
function buildMesh() {
  const positions = [];
  const normals = [];
  const indices = [];
  let index = 0;

  for (let key of voxels) {
    const [x, y, z] = key.split(',').map(Number);

    for (const { dir, corners } of faces) {
      const nx = x + dir[0];
      const ny = y + dir[1];
      const nz = z + dir[2];

      if (isOccupied(nx, ny, nz)) continue; // face not visible

      const faceVerts = corners.map(([dx, dy, dz]) => [x + dx, y + dy, z + dz]);
      const normal = new THREE.Vector3(...dir);

      for (const [vx, vy, vz] of faceVerts) {
        positions.push(vx, vy, vz);
        normals.push(normal.x, normal.y, normal.z);
      }

      indices.push(index, index + 1, index + 2, index, index + 2, index + 3);
      index += 4;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);

  const material = new THREE.MeshStandardMaterial({ color: 0x66cc88, flatShading: false });
  return new THREE.Mesh(geometry, material);
}

// Add mesh to scene
scene.add(buildMesh());

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  if (controls.isLocked) {
    direction.z = Number(move.forward) - Number(move.backward);
    direction.y = Number(move.up) - Number(move.down);
    direction.x = Number(move.right) - Number(move.left);
    direction.normalize();

    const delta = clock.getDelta();
    const speed = 4;
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

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
