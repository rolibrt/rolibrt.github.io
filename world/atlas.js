import * as THREE from 'three';

const SPRITE_SIZE = 16, TEXTURE_SIZE = 512;
const N_SPRITE_SIZE = SPRITE_SIZE / TEXTURE_SIZE;

const UV_OFFSETS = [
  1, 1,
  1, 0,
  0, 0,
  0, 1
];

const atlasTexture = new THREE.TextureLoader().load('textures/textures.png', () => {
  console.log('Texture loaded');
});

atlasTexture.magFilter = THREE.NearestFilter;
atlasTexture.minFilter = THREE.NearestFilter;
atlasTexture.wrapS = THREE.ClampToEdgeWrapping;
atlasTexture.wrapT = THREE.ClampToEdgeWrapping;


// Export for global access
export { SPRITE_SIZE, TEXTURE_SIZE, N_SPRITE_SIZE, UV_OFFSETS, atlasTexture };
