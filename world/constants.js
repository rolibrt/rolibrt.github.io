export const vertexShader = `
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 normal;

varying vec3 vNormal;

void main() {
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
export const fragmentShader = `
precision mediump float;

varying vec3 vNormal;

void main() {

    gl_FragColor = vec4(vNormal * 0.5 + 0.5, 1.0);
}
`;
export const CHUNK_COUNT = Math.pow(20, 3);
export const CHUNK_SIZE = 16;
export const CHUNK_SHIFT = 4;
export const CHUNK_HEIGHT = 128;
export const CHUNK_SLICES = 8;
export const BLOCK_TYPES = Object.freeze({
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    STONE: 3,
    WATER: 4,
});

export function isOutsideHeight(y) {
    return y < 0 || y >= CHUNK_SIZE * CHUNK_SLICES;
}

export function isOutside3D(x,y,z) {
    return isOutside(x) || isOutside(y) || isOutside(z);
}

export function isOutside(value) {
    return value < 0 || value >= CHUNK_SIZE;
}

export function getChunkKey(x, z) {
    return `${x},${z}`;
}