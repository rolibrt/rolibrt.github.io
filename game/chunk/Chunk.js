import ChunkSlice from './ChunkSlice';
import { AllDirections, Direction, HorizontalDirections } from '../Direction';
import { createMeshFromGeometry } from '../block/MeshFactory';
import { buildChunkGeometry } from '../block/GeometryBuilder';
import {
  CHUNK_SIZE, CHUNK_HEIGHT, CHUNK_SLICES, CHUNK_SHIFT, isOutside, isOutsideHeight, getChunkKey
} from '../constants';
import { BlockTypes } from '../block/BlockRegistry';

export default class Chunk {
  constructor(world, chunkX, chunkZ) {
    this.world = world;
    this.chunkX = chunkX;
    this.chunkZ = chunkZ;
    this.slices = Array.from({ length: CHUNK_SLICES }, (_, heightIndex) => new ChunkSlice(heightIndex, 0));
    this.ready = false;
  }

  generate() {
    const baseX = this.chunkX << CHUNK_SHIFT;
    const baseZ = this.chunkZ << CHUNK_SHIFT;
    const baseHeight = 40;
    const seaLevel = 42;

    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let z = 0; z < CHUNK_SIZE; z++) {
        const worldX = baseX + x;
        const worldZ = baseZ + z;

        // Terrain height with variation
        const height = baseHeight + Math.floor(
          3 + Math.sin(worldX * 0.1) * 3 + Math.cos(worldZ * 0.1) * 3 +
          (Math.sin(worldX * 0.05 + worldZ * 0.05) * 2)
        );

        const maxY = Math.max(height, seaLevel);

        for (let y = 0; y <= maxY; y++) {
          if (y > height && y <= seaLevel) {
            this.setBlock(x, y, z, 8); // WATER
          } else if (y === height) {
            this.setBlock(x, y, z, height < seaLevel + 2 ? 6 : 4); // SAND near sea, GRASS higher
          } else if (y >= height - 2) {
            this.setBlock(x, y, z, 3); // DIRT
          } else {
            const rand = Math.random();
            if (rand < 0.05) {
              this.setBlock(x, y, z, 5); // GRAVEL
            } else if (rand < 0.1) {
              this.setBlock(x, y, z, 2); // COBBLE
            } else {
              this.setBlock(x, y, z, 1); // STONE
            }
          }
        }
      }
    }
  }

  placeTree(x, y, z) {
    // Simple oak tree
    const trunkHeight = 4 + Math.floor(Math.random() * 2);
    for (let i = 0; i < trunkHeight; i++) {
      this.setBlock(x, y + i, z, BlockTypes.LOG.id);
    }

    const leafStart = y + trunkHeight - 2;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        for (let dy = 0; dy <= 3; dy++) {
          const dist = Math.abs(dx) + Math.abs(dz) + dy;
          if (dist <= 4) {
            this.setBlock(x + dx, leafStart + dy, z + dz, BlockTypes.LEAVES.id);
          }
        }
      }
    }
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

  getType(slice, wx, wy, wz, nx, ny, nz) {
    if (isOutsideHeight(wy + ny)) return 0;
    var id;
    if (isOutside(ny)) {
      id = this.getBlock(nx, wy + ny, nz);
    } else if (isOutside(nx) || isOutside(nz)) {
      id = this.world.getBlockAt(wx + nx, wy + ny, wz + nz);
    } else {
      id = slice.getBlock(nx, ny, nz);
    }
    return id !== null ? id : 0;
  }

  uploadMesh(slice, [opaqueData, transparentData]) {
    const [opaque, transparent] = createMeshFromGeometry([opaqueData, transparentData]);
    opaque.renderOrder = 1;
    opaque.position.set(
      this.chunkX << CHUNK_SHIFT,
      slice.heightIndex << CHUNK_SHIFT,
      this.chunkZ << CHUNK_SHIFT
    );
    transparent.renderOrder = 2;
    transparent.position.set(
      this.chunkX << CHUNK_SHIFT,
      slice.heightIndex << CHUNK_SHIFT,
      this.chunkZ << CHUNK_SHIFT
    );
    if (slice.opaqueMesh) {
      this.world.scene.remove(slice.opaqueMesh);
      slice.opaqueMesh.geometry.dispose();
    }
    if (slice.transparentMesh) {
      this.world.scene.remove(slice.transparentMesh);
      slice.transparentMesh.geometry.dispose();
    }
    slice.opaqueMesh = opaque;
    slice.transparentMesh = transparent;
    this.world.scene.add(slice.transparentMesh);
    this.world.scene.add(slice.opaqueMesh);
    slice.create = slice.dirty = slice.update = false;
  }

  buildMeshes() {
    this.slices.forEach(slice => {
      this.uploadMesh(slice, buildChunkGeometry(this, slice));
    });
    this.ready = true;
    HorizontalDirections.forEach(direction => {
      const cx = this.chunkX + direction.vec[0];
      const cz = this.chunkZ + direction.vec[2];
      const neighborChunk = this.world.chunks.get(getChunkKey(cx, cz));
      if (neighborChunk) neighborChunk.update = true;
    });
  }

  updateMeshes() {
    this.slices
      .forEach(slice => {
        if (slice.dirty) {
          this.uploadMesh(slice, buildChunkGeometry(this, slice));
        } else if (slice.update) {
          this.uploadMesh(slice, buildChunkGeometry(this, slice));
        }
      });
  }
};