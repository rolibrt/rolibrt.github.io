import { CHUNK_SIZE, isOutside3D } from '../constants';
import { SingleBlockChunkData } from './ChunkData';

export default class ChunkSlice {
  constructor(heightIndex, id) {
    this.heightIndex = heightIndex;
    this.data = new SingleBlockChunkData(0);
    for (let x = 0; x < CHUNK_SIZE; x++) {
      for (let y = 0; y < CHUNK_SIZE; y++) {
        for (let z = 0; z < CHUNK_SIZE; z++) {
          this.setBlock(x, y, z, id);
        }
      }
    }
    this.transparentMesh = null;
    this.opaqueMesh = null;
    this.create = true;
    this.update = false;
  }

  getBlock(x, y, z) {
    if (isOutside3D(x, y, z)) return null;
    return this.data.getBlock(x, y, z) & 0xFF;
  }

  setBlock(x, y, z, id, setDirty = true) {
    if (isOutside3D(x, y, z)) return;
    this.data = this.data.setBlock(x, y, z, id & 0xFF);
    if (setDirty) this.dirty = true;
  }
};