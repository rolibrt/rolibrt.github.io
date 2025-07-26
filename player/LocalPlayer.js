import * as THREE from 'three';
import { Player } from './Player.js';

export class LocalPlayer extends Player {
  constructor(id, name, camera, controls, scene) {
    super(id, name, scene);
    this.camera = camera;
    this.controls = controls;

    this.move = {
      forward: false, backward: false,
      left: false, right: false,
      up: false, down: false,
    };

    this.speed = 20;
    this.setupKeyboardListeners();

    // Use camera object as the visual representation
    this.object = controls.object; 
    this.scene.add(this.object);
  }

  setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW': this.move.forward = true; break;
        case 'KeyS': this.move.backward = true; break;
        case 'KeyA': this.move.left = true; break;
        case 'KeyD': this.move.right = true; break;
        case 'Space': this.move.up = true; break;
        case 'ShiftLeft': this.move.down = true; break;
      }
    });
    document.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW': this.move.forward = false; break;
        case 'KeyS': this.move.backward = false; break;
        case 'KeyA': this.move.left = false; break;
        case 'KeyD': this.move.right = false; break;
        case 'Space': this.move.up = false; break;
        case 'ShiftLeft': this.move.down = false; break;
      }
    });
  }

  update(delta) {
    if (!this.controls.isLocked) return;

    const dir = new THREE.Vector3(
      Number(this.move.right) - Number(this.move.left),
      Number(this.move.up) - Number(this.move.down),
      Number(this.move.forward) - Number(this.move.backward)
    );

    dir.normalize().multiplyScalar(this.speed * delta);

    this.controls.moveRight(dir.x);
    this.controls.moveForward(dir.z);
    this.controls.object.position.y += dir.y;
  }
}
