import { CHUNK_SIZE, CHUNK_SHIFT} from '../constants';

export class ChunkDataLayer {
    setBlock(x, z, id) { }
    getBlock(x, z) { }
};

export class ChunkData {
    setBlock(x, y, z, id) { }
    getBlock(x, y, z) { }
};

export class FullChunkDataLayer extends ChunkDataLayer {
    constructor(id) {
        super();
        this.id = id;
        this.blocks = new Uint8Array(CHUNK_SIZE * CHUNK_SIZE);
        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                this.blocks[(z << CHUNK_SHIFT) | x] = id;
            }
        }
    }

    setBlock(x, z, id) {
        this.blocks[(z << CHUNK_SHIFT) | x] = id;
        return this;
    }

    getBlock(x, z) {
        return this.blocks[(z << CHUNK_SHIFT) | x];
    }
};

export class SingleBlockChunkDataLayer extends ChunkDataLayer {
    constructor(id) {
        super();
        this.id = id;
    }

    setBlock(x, z, id) {
        if (this.id == id) return this;
        var layer = new FullChunkDataLayer(this.id);
        layer.setBlock(x, z, id);
        return layer;
    }

    getBlock(x, z) {
        return this.id;
    }
};

export class LayeredChunkData extends ChunkData {
    constructor(id) {
        super();
        this.layers = Array.from(
            { length: CHUNK_SIZE },
            () => new SingleBlockChunkDataLayer(id));
    }

    setBlock(x, y, z, id) {
        this.layers[y] = this.layers[y].setBlock(x, z, id);
        return this;
    }

    getBlock(x, y, z) {
        return this.layers[y].getBlock(x, z);
    }
};

export class SingleBlockChunkData extends ChunkData {
    constructor(id) {
        super();
        this.id = id;
    }

    setBlock(x, y, z, id) {
        if (this.id == id) return this;
        var chunkData = new LayeredChunkData(this.id);
        chunkData.setBlock(x, y, z, id);
        return chunkData;
    }

    getBlock(x, y, z) {
        return this.id;
    }
};