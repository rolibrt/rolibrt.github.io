export default class BoundingBox {

    constructor(minX, minY, minZ, maxX, maxY, maxZ) {
        this.set(minX, minY, minZ, maxX, maxY, maxZ);
    }

    set(minX, minY, minZ, maxX, maxY, maxZ) {
        this.minX = minX;
        this.minY = minY;
        this.minZ = minZ;
        this.maxX = maxX;
        this.maxY = maxY;
        this.maxZ = maxZ;
    }

    copy(other) {
        this.set(other.minX, other.minY, other.minZ, other.maxX, other.maxY, other.maxZ);
        return this;
    }

    updateFromPositionAndSize(pos, size) {
        this.minX = pos.x;
        this.minY = pos.y;
        this.minZ = pos.z;
        this.maxX = pos.x + size.x;
        this.maxY = pos.y + size.y;
        this.maxZ = pos.z + size.z;
        return this;
    }

    contains(x, y, z) {
        return x >= this.minX && x <= this.maxX &&
            y >= this.minY && y <= this.maxY &&
            z >= this.minZ && z <= this.maxZ;
    }

    intersects(other) {
        return (
            this.maxX > other.minX && this.minX < other.maxX &&
            this.maxY > other.minY && this.minY < other.maxY &&
            this.maxZ > other.minZ && this.minZ < other.maxZ
        );
    }

    collides(other) {
        return this.intersects(other); // alias for clarity
    }

    grow(dx, dy = dx, dz = dx) {
        this.minX -= dx;
        this.minY -= dy;
        this.minZ -= dz;
        this.maxX += dx;
        this.maxY += dy;
        this.maxZ += dz;
        return this;
    }

    growMax(dx, dy = dx, dz = dx) {
        this.maxX += dx;
        this.maxY += dy;
        this.maxZ += dz;
        return this;
    }

    shrink(dx, dy = dx, dz = dx) {
        return this.grow(-dx, -dy, -dz);
    }

    add(vec) {
        this.minX += vec.x;
        this.minY += vec.y;
        this.minZ += vec.z;
        this.maxX += vec.x;
        this.maxY += vec.y;
        this.maxZ += vec.z;
        return this;
    }

    subtract(vec) {
        this.add({ x: -vec.x, y: -vec.y, z: -vec.z });
        return this;
    }

    toString() {
        return `Box[(${this.minX}, ${this.minY}, ${this.minZ}) -> (${this.maxX}, ${this.maxY}, ${this.maxZ})]`;
    }
}
