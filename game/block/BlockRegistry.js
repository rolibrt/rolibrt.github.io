// BlockRegistry.js
import { Block } from './Block.js';
import { AllDirections } from '../Direction.js';
import {
  CHUNK_SIZE, CHUNK_SHIFT
} from '../constants.js';
import waterVerts from './shapes/water.json';

export const BlockTypes = {
  AIR: new Block({ id: 0, name: 'air', transparent: true }),
  STONE: new Block({ id: 1, name: 'stone', textureFaces: { ALL: [1, 0] } }),
  COBBLE: new Block({ id: 2, name: 'cobble', textureFaces: { ALL: [0, 1] } }),
  DIRT: new Block({ id: 3, name: 'dirt', textureFaces: { ALL: [2, 0] } }),
  GRASS: new Block({
    id: 4, name: 'grass',
    textureFaces:
    {
      UP: [0, 0],
      DOWN: [2, 0],
      NORTH: [3, 0],
      SOUTH: [3, 0],
      EAST: [3, 0],
      WEST: [3, 0],
    }
  }),
  GRAVEL: new Block({ id: 5, name: 'gravel', textureFaces: { ALL: [3, 1] } }),
  SAND: new Block({ id: 6, name: 'sand', textureFaces: { ALL: [2, 1] } }),
  GLASS: new Block({ id: 7, name: 'glass', transparent: true, textureFaces: { ALL: [1, 3] } }),
  WATER: new Block({
    id: 8, name: 'water',
    transparent: true,
    customGeometry: (chunk, slice, block, index, x, y, z) => buildWaterGeometry(chunk, slice, block, index, x, y, z),
    textureFaces: { ALL: [3, 4] }
  }),
  LOG: new Block({
    id: 9, name: 'log',
    textureFaces:
    {
      UP: [5, 1],
      DOWN: [5, 1],
      NORTH: [4, 1],
      SOUTH: [4, 1],
      EAST: [4, 1],
      WEST: [4, 1],
    }
  }),
  LEAVES: new Block({ id: 10, name: 'leaves', transparent: true, textureFaces: { ALL: [4, 3] } }),
  /*
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

function buildWaterGeometry(chunk, slice, block, index, x, y, z) {
  const positions = [];
  const normals = [];
  const indices = [];
  const uvs = [];
  const uv = block.getUVCoords('ALL');

  const wx = (chunk.chunkX << CHUNK_SHIFT);
  const wy = (slice.heightIndex << CHUNK_SHIFT);
  const wz = (chunk.chunkZ << CHUNK_SHIFT);
  let indexOffset = index;
  for (const face of AllDirections) {
    const nx = x + face.vec[0];
    const ny = y + face.vec[1];
    const nz = z + face.vec[2];
    const neighborId = chunk.getType(slice, wx, wy, wz, nx, ny, nz);
    const neighbor = BlockIdMap[neighborId] ?? BlockTypes.AIR;
    if (neighbor === BlockTypes.AIR) {
      const topId = chunk.getType(slice, wx, wy + 1, wz, nx, ny, nz);
    const top = BlockIdMap[topId] ?? BlockTypes.AIR;
      for (let i = 0; i < 4; i++) {
        const [dx, dy, dz] = top === BlockTypes.WATER ? face.corners[i] : waterVerts[face.name][i];
        positions.push(x + dx, y + dy, z + dz);
        normals.push(...face.vec);
        uvs.push(uv[i * 2], uv[i * 2 + 1]);
      }
      indices.push(indexOffset, indexOffset + 1, indexOffset + 2, indexOffset + 2, indexOffset + 3, indexOffset);
      indexOffset += 4;
    }
  }

  return { positions, normals, indices, uvs };
}
