import * as THREE from 'three';

const SPRITE_SIZE = 16, TEXTURE_SIZE = 256;
const N_SPRITE_SIZE = SPRITE_SIZE / TEXTURE_SIZE;

const atlasTexture = new THREE.TextureLoader().load('textures/terrain.png', () => {
  console.log('Texture loaded');
});

atlasTexture.magFilter = THREE.NearestFilter;
atlasTexture.minFilter = THREE.NearestMipMapNearestFilter; // or NearestMipMapNearestFilter
atlasTexture.generateMipmaps = true;
atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
atlasTexture.wrapT = THREE.ClampToEdgeWrapping;


// Export for global access
export { SPRITE_SIZE, TEXTURE_SIZE, N_SPRITE_SIZE, atlasTexture };
