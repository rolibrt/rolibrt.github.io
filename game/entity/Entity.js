import * as THREE from 'three';
import BoundingBox from '../physics/BoundingBox';

export class Entity {
    constructor(world, id, data) {
        this.world = world;
        this.id = id;
        this.width = data?.width;
        this.height = data?.height;
        this.position = new THREE.Vector3(data?.position?.x, data?.position?.y, data?.position?.z);
        this.yaw = data?.yaw;
        this.pitch = data?.pitch;
        this.velocity = new THREE.Vector3(data?.velocity?.x, data?.velocity?.y, data?.velocity?.z);
        this.boundingBox = new BoundingBox()
            .add(this.position.x, this.position.y, this.position.z)
            .grow(this.width / 2, 0, this.width / 2)
            .growMax(0, this.height, 0);
    }

    updateBoundingBox() {

    }

    move(pos) {
        
    }

    getPosition() {
        return this.position.clone();
    }

    setPosition(x, y, z) {
        this.position.setX(x);
        this.position.setY(y);
        this.position.setZ(z);
    }

    update(delta) {
        // Optional override in subclasses
    }

    dispose() {
        this.scene.remove(this.object);
    }
}
