// GeometryBuilder.js
import { AllDirections } from '../Direction.js';
import { BlockIdMap, BlockTypes } from './BlockRegistry.js';
import {
    CHUNK_SIZE, CHUNK_SHIFT
} from '../constants.js';

export function buildChunkGeometry(chunk, slice) {
    const positions = [], normals = [], indices = [], uvs = [];
    const tpositions = [], tnormals = [], tindices = [], tuvs = [];
    let index = 0, tindex = 0;
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
                    if (block.isTransparent()) {
                        const blockGeometry = block.buildGeometry(chunk, slice, tindex, x, y, z);
                        tpositions.push(...blockGeometry.positions);
                        tnormals.push(...blockGeometry.normals);
                        tuvs.push(...blockGeometry.uvs);
                        tindices.push(...blockGeometry.indices);
                        tindex += blockGeometry.positions.length / 3;
                    } else {
                        const blockGeometry = block.buildGeometry(chunk, slice, index, x, y, z);
                        positions.push(...blockGeometry.positions);
                        normals.push(...blockGeometry.normals);
                        uvs.push(...blockGeometry.uvs);
                        indices.push(...blockGeometry.indices);
                        index += blockGeometry.positions.length / 3;
                    }
                } else if (block.hasUniformTextures()) {
                    const uv = block.getUVCoords('ALL');
                    for (const face of AllDirections) {
                        const nx = x + face.vec[0];
                        const ny = y + face.vec[1];
                        const nz = z + face.vec[2];
                        const neighborId = chunk.getType(slice, wx, wy, wz, nx, ny, nz);
                        const neighbor = BlockIdMap[neighborId] ?? BlockTypes.AIR;
                        if (neighbor.isTransparent()) {
                            if (block.isTransparent()) {
                                if (block === BlockTypes.WATER && block === neighbor) continue;
                                for (let i = 0; i < 4; i++) {
                                    const [dx, dy, dz] = face.corners[i];
                                    tpositions.push(x + dx, y + dy, z + dz);
                                    tnormals.push(...face.vec);
                                    tuvs.push(uv[i * 2], uv[i * 2 + 1]);
                                }
                                tindices.push(tindex, tindex + 1, tindex + 2, tindex + 2, tindex + 3, tindex);
                                tindex += 4;
                            } else {
                                for (let i = 0; i < 4; i++) {
                                    const [dx, dy, dz] = face.corners[i];
                                    positions.push(x + dx, y + dy, z + dz);
                                    normals.push(...face.vec);
                                    uvs.push(uv[i * 2], uv[i * 2 + 1]);
                                }
                                indices.push(index, index + 1, index + 2, index + 2, index + 3, index);
                                index += 4;
                            }
                        }
                    }
                } else {
                    for (const face of AllDirections) {
                        const nx = x + face.vec[0];
                        const ny = y + face.vec[1];
                        const nz = z + face.vec[2];
                        const neighborId = chunk.getType(slice, wx, wy, wz, nx, ny, nz);
                        const neighbor = BlockIdMap[neighborId] ?? BlockTypes.AIR;
                        if (neighbor.isTransparent()) {
                            const uv = block.getUVCoords(face.name);
                            if (block.isTransparent()) {
                                for (let i = 0; i < 4; i++) {
                                    const [dx, dy, dz] = face.corners[i];
                                    tpositions.push(x + dx, y + dy, z + dz);
                                    tnormals.push(...face.vec);
                                    tuvs.push(uv[i * 2], uv[i * 2 + 1]);
                                }
                                tindices.push(tindex, tindex + 1, tindex + 2, tindex + 2, tindex + 3, tindex);
                                tindex += 4;
                            } else {
                                for (let i = 0; i < 4; i++) {
                                    const [dx, dy, dz] = face.corners[i];
                                    positions.push(x + dx, y + dy, z + dz);
                                    normals.push(...face.vec);
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
    }
    return [
        { positions, normals, indices, uvs },
        {
            positions: tpositions,
            normals: tnormals,
            indices: tindices,
            uvs: tuvs
        }
    ];
};