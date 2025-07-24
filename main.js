import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls setup
const controls = new PointerLockControls(camera, document.body);

document.body.addEventListener('click', () => {
  controls.lock();
});

scene.add(controls.getObject());

// Floor cubes (voxels)
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshNormalMaterial();

for (let x = -5; x <= 5; x++) {
  for (let z = -5; z <= 5; z++) {
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(x, 0, z);
    scene.add(cube);
  }
}

camera.position.y = 1.6; // player eye height

// Movement controls
const move = { forward: false, backward: false, left: false, right: false };
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW': move.forward = true; break;
    case 'KeyS': move.backward = true; break;
    case 'KeyA': move.left = true; break;
    case 'KeyD': move.right = true; break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW': move.forward = false; break;
    case 'KeyS': move.backward = false; break;
    case 'KeyA': move.left = false; break;
    case 'KeyD': move.right = false; break;
  }
});

function animate() {
  requestAnimationFrame(animate);

  if (controls.isLocked) {
    direction.z = Number(move.forward) - Number(move.backward);
    direction.x = Number(move.right) - Number(move.left);
    direction.normalize();

    const speed = 0.1;
    velocity.x = direction.x * speed;
    velocity.z = direction.z * speed;

    controls.moveRight(velocity.x);
    controls.moveForward(velocity.z);
  }

  renderer.render(scene, camera);
}

animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
