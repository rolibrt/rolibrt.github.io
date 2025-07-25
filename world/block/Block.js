// Block.js
export class Block {
  constructor({ id, name, opaque = true, transparent = false, customGeometry = null, textureFaces = {} }) {
    this.id = id;
    this.name = name;
    this.opaque = opaque;
    this.transparent = transparent;
    this.customGeometry = customGeometry; // function or null
    this.textureFaces = textureFaces; // { UP: 0, DOWN: 1, ... } or single value
  }

  isOpaque() {
    return this.opaque && !this.transparent;
  }

  getTextureIndex(face) {
    return this.textureFaces[face] ?? this.textureFaces['ALL'] ?? 0;
  }

  hasCustomGeometry() {
    return typeof this.customGeometry === 'function';
  }

  buildGeometry(x, y, z) {
    return this.customGeometry ? this.customGeometry(x, y, z) : null;
  }
}