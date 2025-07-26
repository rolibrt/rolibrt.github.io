import * as THREE from 'three';

export class Player {
  constructor(id, name, scene) {
    this.id = id;
    this.name = name;
    this.scene = scene;

    this.object = new THREE.Object3D(); // Placeholder, subclasses can override
    this.position = new THREE.Vector3();
    this.velocity = new THREE.Vector3();

    this.scene.add(this.object);
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z);
    this.object.position.copy(this.position);
  }

  getPosition() {
    return this.object.position.clone();
  }

  update(delta) {
    // Optional override in subclasses
  }

  dispose() {
    this.scene.remove(this.object);
  }
}
