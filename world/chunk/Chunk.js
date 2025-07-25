import * as THREE from 'three';
import ChunkSlice from './ChunkSlice';
import { AllDirections, Direction, HorizontalDirections } from '../Direction';
import {
  CHUNK_SIZE, CHUNK_SLICES, CHUNK_SHIFT, isOutside,
  isOutsideHeight, vertexShader, fragmentShader, getChunkKey
} from '../constants';

export default class Chunk {
  constructor(world, chunkX, chunkZ) {
    this.world = world;
    this.chunkX = chunkX;
    this.chunkZ = chunkZ;
    this.slices = Array.from({ length: CHUNK_SLICES }, (_, heightIndex) => new ChunkSlice(heightIndex, 0));
  }

  generate() {
    const baseX = this.chunkX << CHUNK_SHIFT;
    const baseZ = this.chunkZ << CHUNK_SHIFT;
    const worldY = 40;

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const worldX = baseX + x;
        const worldZ = baseZ + z;
        const height = worldY + Math.floor(3 + Math.sin(worldX * 0.15) * 2 + Math.cos(worldZ * 0.15) * 2);
        for (let y = 0; y <= height; y++) {
          this.setBlock(x, y, z, 1);
        }
      }
    }
  }

  setDirty(value) {
    this.slices.forEach(slice => slice.dirty = value);
  }

  setNeighborsDirty() {
    HorizontalDirections.forEach(direction => this.setNeighborDirty(direction));
  }

  setNeighborDirty(direction) {
    const cx = this.chunkX + direction.vec[0];
    const cz = this.chunkZ + direction.vec[2];
    const neighborChunk = this.world.chunks.get(getChunkKey(cx, cz));
    if (!neighborChunk) return;
    neighborChunk.setDirty(true);
  }

  setSliceDirty(height, value) {
    if (isOutsideHeight(height)) return;
    this.slices[height >> CHUNK_SHIFT].dirty = value;
  }

  setNeighborSliceDirty(height, direction) {
    const cx = this.chunkX + direction.vec[0];
    const cz = this.chunkZ + direction.vec[2];
    const neighborChunk = this.world.chunks.get(getChunkKey(cx, cz));
    if (!neighborChunk) return;
    neighborChunk.setSliceDirty(height, true);
  }

  setBlock(x, y, z, id) {
    if (isOutside(x) || isOutside(z) || isOutsideHeight(y)) return;
    const localY = y & (CHUNK_SIZE - 1);
    this.slices[y >> CHUNK_SHIFT].setBlock(x, localY, z, id);
    if (x == 0) {
      this.setNeighborSliceDirty(y, Direction.WEST);
    } else if (x == CHUNK_SIZE - 1) {
      this.setNeighborSliceDirty(y, Direction.EAST);
    }
    if (z == 0) {
      this.setNeighborSliceDirty(y, Direction.NORTH);
    } else if (z == CHUNK_SIZE - 1) {
      this.setNeighborSliceDirty(y, Direction.SOUTH);
    }
    if (localY == 0) {
      this.setSliceDirty(y, true);
    } else if (localY == CHUNK_SIZE - 1) {
      this.setSliceDirty(y, true);
    }
  }

  getBlock(x, y, z) {
    if (isOutsideHeight(y)) return 0;
    return this.slices[y >> CHUNK_SHIFT].getBlock(x, y & (CHUNK_SIZE - 1), z);
  }

  buildSliceMesh(slice) {
    if (!slice) return null;
    const positions = [], normals = [], indices = [];
    let index = 0;
    const wx = (this.chunkX << CHUNK_SHIFT);
    const wy = (slice.heightIndex << CHUNK_SHIFT);
    const wz = (this.chunkZ << CHUNK_SHIFT);
    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          const blockId = slice.getBlock(x, y, z);
          if (blockId === 0) continue;
          for (const direction of AllDirections) {
            const nx = x + direction.vec[0];
            const ny = y + direction.vec[1];
            const nz = z + direction.vec[2];
            if (this.isSolid(slice,wx, wy, wz, nx, ny, nz)) continue;
            for (const [dx, dy, dz] of direction.corners) {
              positions.push(x + dx, y + dy, z + dz);
              normals.push(...direction.vec);
            }
            indices.push(
              index, index + 1, index + 2,
              index + 2, index + 3, index
            );
            index += 4;
          }
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setIndex(indices);

    const material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader
    });
    return new THREE.Mesh(geometry, material);
  }

  isSolid(slice, wx, wy, wz, nx, ny, nz) {
    if (isOutsideHeight(wy + ny)) return false;
    var id;
    if (isOutside(ny)) {
      id = this.getBlock(nx, wy + ny, nz);
    } else if (isOutside(nx) || isOutside(nz)) {
      id = this.world.getBlockAt(wx + nx, wy + ny, wz + nz);
    } else {
      id = slice.getBlock(nx, ny, nz);
    }
    return id !== null && id !== 0;
  }

  buildSlice(slice) {
    const mesh = this.buildSliceMesh(slice);
    mesh.position.set(
      this.chunkX << CHUNK_SHIFT,
      slice.heightIndex << CHUNK_SHIFT,
      this.chunkZ << CHUNK_SHIFT
    );
    if (slice.mesh) {
      this.world.scene.remove(slice.mesh);
      slice.mesh.geometry.dispose();
    }
    slice.mesh = mesh;
    this.world.scene.add(slice.mesh);
    slice.dirty = false;
  }

  buildMeshes() {
    return this.slices.forEach(slice => this.buildSlice(slice));
  }
};