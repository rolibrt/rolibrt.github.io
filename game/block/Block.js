import { N_SPRITE_SIZE } from '../atlas';
import cubeVertices from './shapes/cube.json';

export class Block {
  constructor({ id, name, transparent = false, customGeometry = null, textureFaces = {} }) {
    this.id = id;
    this.name = name;
    this.transparent = transparent;
    this.customGeometry = customGeometry; // function or null
    this.textureFaces = textureFaces; // { UP: [0,0], DOWN: [0,1], ... } or single value
    this.uniformTextures = textureFaces['ALL'] !== undefined;
  }

  isTransparent() {
    return this.transparent;
  }

  getTextureCoords(face) {
    return this.textureFaces[face] ?? this.textureFaces['ALL'] ?? [0, 0];
  }

  getUVCoords(face) {
    const texCoords = this.getTextureCoords(face);
    return getUVs(texCoords[0], texCoords[1]);
  }

  hasUniformTextures() {
    return this.uniformTextures;
  }

  hasCustomGeometry() {
    return typeof this.customGeometry === 'function';
  }

  buildGeometry(chunk, slice, index, x, y, z) {
    return this.customGeometry ? this.customGeometry(chunk, slice, this, index, x, y, z) : null;
  }
}

function getUVs(tileX, tileY) {
  const uMin = tileX * N_SPRITE_SIZE;
  const vMin = 1 - (tileY + 1) * N_SPRITE_SIZE;  // flipped V axis
  const uMax = (tileX + 1) * N_SPRITE_SIZE;
  const vMax = 1 - tileY * N_SPRITE_SIZE;

  // Return UVs in this order (matching your face corners):
  // top-right, bottom-right, bottom-left, top-left
  return [
    uMin, vMin,
    uMin, vMax,
    uMax, vMax,
    uMax, vMin,
  ];
}