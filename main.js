import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import World from './world/World';
import { LocalPlayer } from './player/LocalPlayer';
import { RemotePlayer } from './player/RemotePlayer';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({});
const gl = renderer.getContext();
renderer.setSize(window.innerWidth, window.innerHeight);
gl.enable(gl.BLEND);
gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
gl.frontFace(gl.CW);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new PointerLockControls(camera, document.body);
document.body.addEventListener('click', () => controls.lock());

const players = new Map();

const localPlayer = new LocalPlayer('you', 'YourName', camera, controls, scene);
localPlayer.setPosition(0, 50, 0);
players.set(localPlayer.id, localPlayer);

// On network join:
const other = new RemotePlayer('123', 'OtherPlayer', scene);
other.setPosition(0, 50, 0);
players.set(other.id, other);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 0.9);
light.position.set(0, 150, 0);
scene.add(light);

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
  localPlayer.update(delta);
  for (const player of players.values()) {
    player.update(delta); // localPlayer moves, others interpolate
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

function simulateRemoteMovement() {
  // Random new position within a 20x20x20 cube
  const newPos = new THREE.Vector3(
    (Math.random() - 0.5),
    50, // keep player standing on ground (y=1)
    (Math.random() - 0.5)
  );
  other.updateRemotePosition(newPos);
}

// Call simulateRemoteMovement every 2 seconds
setInterval(simulateRemoteMovement, 50);
