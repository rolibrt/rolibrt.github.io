export const vertexShader = `
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

varying vec3 vNormal;
varying vec2 vUv;

void main() {
    vNormal = normal;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
export const fragmentShader = `
precision mediump float;

uniform sampler2D atlas;

varying vec3 vNormal;
varying vec2 vUv;

void main() {
    vec3 normal = normalize(vNormal);

    // Hardcoded light direction — coming diagonally from top-right-front
    // Fake directional light (from above)
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float light = dot(normal, lightDir);
    light = clamp(light, 0.2, 1.0); // minimum ambient light

    vec4 tex = texture2D(atlas, vUv);
    gl_FragColor = vec4(tex.rgb * light, tex.a);
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