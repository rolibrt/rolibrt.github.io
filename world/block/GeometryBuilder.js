// GeometryBuilder.js
import { AllDirections } from '../Direction.js';
import { BlockIdMap } from './BlockRegistry.js';
import { SPRITE_SIZE, TEXTURE_SIZE, N_SPRITE_SIZE, UV_OFFSETS } from '../atlas'
import {
    CHUNK_SIZE, CHUNK_SHIFT
} from '../constants';

export function buildChunkGeometry(chunk, slice) {
    const positions = [], normals = [], indices = [], uvs = [];
    let index = 0;
    const wx = (chunk.chunkX << CHUNK_SHIFT);
    const wy = (slice.heightIndex << CHUNK_SHIFT);
    const wz = (chunk.chunkZ << CHUNK_SHIFT);
    for (let y = 0; y < CHUNK_SIZE; y++) {
        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const blockId = slice.getBlock(x, y, z);
                if (blockId === 0) continue;
                const block = BlockIdMap[blockId];

                if (block.hasCustomGeometry()) {
                    const { positions: p, normals: n, indices: i, uvs: u } = block.buildGeometry(wx, wy, wz);
                    positions.push(...p);
                    normals.push(...n);
                    uvs.push(...u);
                    indices.push(...i.map(i => i + index));
                    index += p.length / 3;
                } else {
                    for (const dir of AllDirections) {
                        const nx = x + dir.vec[0];
                        const ny = y + dir.vec[1];
                        const nz = z + dir.vec[2];
                        const neighborId = chunk.getType(slice, wx, wy, wz, nx, ny, nz);
                        const neighbor = BlockIdMap[neighborId] ?? BlockTypes.AIR;

                        if (!neighbor.isOpaque()) {
                            const uv = getUVs(blockId, 0);
                            for (let i = 0; i < 4; i++) {
                                const [dx, dy, dz] = dir.corners[i];
                                positions.push(x + dx, y + dy, z + dz);
                                normals.push(...dir.vec);
                                uvs.push(uv[i * 2], uv[i * 2 + 1]);
                            }
                            indices.push(index, index + 1, index + 2, index + 2, index + 3, index);
                            index += 4;
                        }
                    }
                }
            }
        }
    }
    return { positions, normals, indices, uvs };
}

const TILES_PER_ROW = TEXTURE_SIZE / SPRITE_SIZE; // 32

/**
 * Get UV coordinates for a tile index (left-top origin).
 * @param {number} index - Tile index from 0 to 1023 (32x32 atlas).
 * @returns {number[]} - UV coordinates (array of 4 corners).
 */
function getUVs(tileX, tileY) {
    const uMin = tileX * N_SPRITE_SIZE;
    const vMin = 1 - (tileY + 1) * N_SPRITE_SIZE;  // flipped V axis
    const uMax = (tileX + 1) * N_SPRITE_SIZE;
    const vMax = 1 - tileY * N_SPRITE_SIZE;

    // Return UVs in this order (matching your face corners):
    // top-right, bottom-right, bottom-left, top-left
    return [
        uMax, vMax,
        uMax, vMin,
        uMin, vMin,
        uMin, vMax,
    ];
}
