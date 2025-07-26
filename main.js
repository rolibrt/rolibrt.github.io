import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import World from './world/World';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ });
const gl = renderer.getContext();
renderer.setSize(window.innerWidth, window.innerHeight);
gl.enable(gl.BLEND);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
gl.frontFace(gl.CW);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 0.9);
light.position.set(0, 150, 0);
scene.add(light);

// Controls
const controls = new PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => controls.lock());
scene.add(controls.object);
camera.position.z = 30;
camera.position.y = 20;

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

const worlds = [];
worlds[0] = new World(scene, "world");

const clock = new THREE.Clock();
let lastUpdate = 0;
const updateInterval = 50;

function animate(time) {

  const delta = clock.getDelta();
  if (time - lastUpdate >= updateInterval) {
    worlds.forEach(world => world.tick(camera));
    lastUpdate = time;
  }
  if (controls.isLocked) {
    direction.z = Number(move.forward) - Number(move.backward);
    direction.x = Number(move.right) - Number(move.left);
    direction.y = Number(move.up) - Number(move.down);
    direction.normalize();

    const speed = 20;
    velocity.x = direction.x * speed * delta;
    velocity.y = direction.y * speed * delta;
    velocity.z = direction.z * speed * delta;

    controls.moveRight(velocity.x);
    controls.moveForward(velocity.z);
    controls.object.position.y += velocity.y;
  }

  const coordElement = document.getElementById('cameraCoords');
  if (coordElement) {
    const pos = camera.position;
    coordElement.textContent = `x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z.toFixed(2)}`;
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
