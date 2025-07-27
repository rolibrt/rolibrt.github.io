import * as THREE from 'three';
import { Entity } from './Entity';

export class Player extends Entity {
    constructor(world, id, data) {
        super(world, id, data);
        this.name = data?.name;
    }
}
