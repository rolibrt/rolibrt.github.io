import { Player } from './Player.js';
import * as THREE from 'three';

const indep = true;

export class RemotePlayer extends Player {
    constructor(id, name, scene) {
        super(id, name, scene);

        // Simple capsule or box for now
        const geometry = new THREE.CapsuleGeometry(0.4, 1.0, 4, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x00ffff });
        this.object = new THREE.Mesh(geometry, material);
        this.object.castShadow = true;

        this.scene.add(this.object);
    }

    updateRemotePosition(newPos) {
        this.object.position.copy(newPos);
    }

    update(delta) {
        if (!this.targetPosition) return; // no new position yet
        if (indep) {// TODO
            const lerpSpeed = 5; // units per second
            const t = 1 - Math.exp(-lerpSpeed * delta);
            this.object.position.lerp(this.targetPosition, t);
        } else {
            // Smoothly move the mesh towards the target position
            this.object.position.lerp(this.targetPosition, 0.1); // 0.1 = interpolation speed
        }
    }
}
