// BlockRegistry.js
import { Block } from './Block.js';

export const BlockTypes = {
  AIR: new Block({ id: 0, name: 'air', opaque: false }),
  STONE: new Block({ id: 1, name: 'stone', textureFaces: { ALL: 1 } }),
  COBBLE: new Block({ id: 2, name: 'cobble', textureFaces: { ALL: 2 } }),
  DIRT: new Block({ id: 3, name: 'dirt', textureFaces: { ALL: 3 } }),
  GRASS: new Block({ id: 4, name: 'grass', textureFaces: { ALL: 4 } }),
  GRAVEL: new Block({ id: 5, name: 'gravel', textureFaces: { ALL: 5 } }),
  /*
  GLASS: new Block({ id: 2, name: 'glass', opaque: false, transparent: true, textureFaces: { ALL: 1 } }),
  FENCE: new Block({
    id: 3,
    name: 'fence',
    opaque: false,
    transparent: true,
    customGeometry: (x, y, z) => buildFenceGeometry(x, y, z),
    textureFaces: { ALL: 2 },
  }),
  GRASS: new Block({
    id: 5,
    name: 'grass',
    textureFaces: {
      UP: 4,       // green grass top
      DOWN: 3,     // dirt
      NORTH: 5,    // grass side
      SOUTH: 5,
      EAST: 5,
      WEST: 5,
    },
  }),*/
};

export const BlockIdMap = Object.fromEntries(Object.values(BlockTypes).map(b => [b.id, b]));