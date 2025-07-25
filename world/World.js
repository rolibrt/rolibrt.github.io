import Chunk from './chunk/Chunk';
import { CHUNK_SIZE, CHUNK_SHIFT, getChunkKey } from './constants';

export default class World {
  constructor(scene, name) {
    this.scene = scene;
    this.name = name;
    this.chunks = new Map();
    this.generate();
  }

  generate() {
    for (let cx = -2; cx <= 2; cx++) {
      for (let cz = -2; cz <= 2; cz++) {
        this.getOrCreateChunk(cx, cz);
      }
    }
  }

  tick(camera) {
    this.chunks.forEach((chunk, _) => {
      chunk.slices.forEach(slice => {
        if (slice.dirty) {
          chunk.buildSlice(slice);
        }
      });
    });
    const x = camera.position.x >> CHUNK_SHIFT;
    const z = camera.position.z >> CHUNK_SHIFT;
    for (let cx = x - 2; cx <= x + 2; cx++) {
      for (let cz = z - 2; cz <= z + 2; cz++) {
        this.getOrCreateChunk(cx, cz);
      }
    }
  }

  getOrCreateChunk(x, z) {
    const key = getChunkKey(x, z);
    var chunk = this.chunks.get(key);
    if (!chunk) {
      chunk = new Chunk(this, x, z);
      chunk.generate();
      this.chunks.set(key, chunk);
      chunk.buildMeshes();
      chunk.setNeighborsDirty();
    }
    return chunk;
  }

  getBlockAt(wx, wy, wz) {
    const chunk = this.chunks.get(getChunkKey(wx >> CHUNK_SHIFT, wz >> CHUNK_SHIFT));
    if (!chunk) return null;
    return chunk.getBlock(wx & (CHUNK_SIZE - 1), wy, wz & (CHUNK_SIZE - 1));
  }

  setBlockAt(wx, wy, wz, id) {
    const chunk = this.chunks.get(getChunkKey(wx >> CHUNK_SHIFT, wz >> CHUNK_SHIFT));
    if (!chunk) return;
    return chunk.setBlock(wx & (CHUNK_SIZE - 1), wy, wz & (CHUNK_SIZE - 1), id);
  }
};