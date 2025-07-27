import * as THREE from 'three';
import { Player } from '../game/entity/Player.js';
import { getRotation, setRotation } from '../game/physics/CameraUtils.js'

export class LocalPlayer extends Player {
    constructor(world, id, data, camera, controls) {
        super(world, id, data);
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
        this.updateControlRotation();
        this.updateControlPosition();
        this.world.scene.add(this.object);
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
        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === document.body) {
                this.mouseMoved = true;

                // Optional: you can access movement deltas here
                const dx = event.movementX || 0;
                const dy = event.movementY || 0;

                // console.log("Mouse moved:", dx, dy);
            }
        });
    }

    getInfo() {
        const pos = this.getPosition();
        return `x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z.toFixed(2)} 
                yaw: ${this.yaw.toFixed(2)}, pitch: ${this.pitch.toFixed(2)}`
    }

    setPosition(x, y, z) {
        super.setPosition(x, y, z);
        this.updateControlPosition();
    }

    updateControlRotation() {
        setRotation(this.camera, this.yaw, this.pitch);
    }

    updateControlPosition() {
        this.controls.object.position.copy(this.position);
        this.controls.update();
    }

    update(delta) {
        if (!this.controls.isLocked) return;
        
        if (this.mouseMoved) {
            const {yaw, pitch} = getRotation(this.camera);
            this.yaw = yaw;
            this.pitch = pitch;
            this.mouseMoved = false;
        }
        const movement = new THREE.Vector3(
            Number(this.move.right) - Number(this.move.left),
            Number(this.move.up) - Number(this.move.down),
            Number(this.move.forward) - Number(this.move.backward)
        );

        if (movement.lengthSq() > 0) {
            movement.normalize().multiplyScalar(this.speed * delta);
            this.controls.moveRight(movement.x);
            this.controls.moveForward(movement.z);
            this.controls.object.position.y += movement.y;
            this.position.copy(this.controls.object.position);
        }
    }
}
