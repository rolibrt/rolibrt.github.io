import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
import World from './game/World';
import { LocalPlayer } from './player/LocalPlayer';
import { RemotePlayer } from './player/RemotePlayer';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const controls = new PointerLockControls(camera, document.body);
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
document.body.addEventListener('click', () => controls.lock());
const coordElement = document.getElementById('cameraCoords');

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 0.9);
light.position.set(0, 150, 0);
scene.add(light);

const worlds = [];
worlds[0] = new World(scene, "world");

const players = new Map();

const playerData = {
  name: 'Player',
  position: {
    x: 0,
    y: 47,
    z: 0,
  },
  yaw: 90,
  pitch: 5,
  width: 0.6,
  height: 1.8,
}

const localPlayer = new LocalPlayer(worlds[0], 1, playerData, camera, controls, scene);
players.set(localPlayer.id, localPlayer);

const otherData = {
  name: 'Other',
  position: {
    x: 0,
    y: 47,
    z: 0,
  },
  yaw: 45,
  pitch: 5,
  width: 0.6,
  height: 1.8,
}
// On network join:
const other = new RemotePlayer(worlds[0], 2, otherData, scene);
players.set(other.id, other);

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
  if (coordElement) {
    coordElement.textContent = localPlayer.getInfo();
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
  other.setTargetPosition(other.getPosition().add(new THREE.Vector3(
    (Math.random() - 0.5) * 5,
    0,
    (Math.random() - 0.5) * 5
  )));
}

// Call simulateRemoteMovement every 2 seconds
//setInterval(simulateRemoteMovement, 500);
