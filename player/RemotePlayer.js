import { Player } from '../game/entity/Player.js';
import { createMinecraftPlayer } from './PlayerModel.js';
import * as THREE from 'three';

export class RemotePlayer extends Player {
    constructor(world, id, data) {
        super(world, id, data);
        this.targetPosition = this.getPosition();
        this.object = createMinecraftPlayer('textures/steve.png');
        this.object.position.copy(this.position);
        this.object.castShadow = true;
        this.world.scene.add(this.object);
    }

    setTargetPosition(pos) {
        this.targetPosition.copy(pos);
    }

    setPosition(x, y, z) {
        super.setPosition(x, y, z);
        this.object.position.copy(this.position);
    }

    update(delta) {
        if (this.position.equals(this.targetPosition)) return;
        const t = 1 - Math.exp(-5 * delta);
        this.position.lerp(this.targetPosition, t);
        this.object.position.copy(this.position);
    }
}