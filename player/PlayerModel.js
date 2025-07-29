import * as THREE from 'three';

// Helper to create a BoxGeometry with Minecraft UVs
function createSkinnedBox(width, height, depth, texture, uvMap) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const uv = geometry.attributes.uv;

  for (let face = 0; face < 6; face++) {
    const [uMin, vMin, uMax, vMax] = uvMap[face];
    for (let i = 0; i < 4; i++) {
      const index = face * 4 + i;
      const x = i === 0 || i === 2 ? uMin : uMax;
      const y = i === 2 || i === 3 ? vMax : vMin;
      uv.array[index * 2] = x / 64;
      uv.array[index * 2 + 1] = 1 - y / 64;
    }
  }

  uv.needsUpdate = true;
  return new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: texture, transparent: true }));
}

// UV maps per face: [Right, Left, Top, Bottom, Front, Back]
const UVMaps = {
  head: [[16, 8, 24, 16], [0, 8, 8, 16], [8, 0, 16, 8], [16, 0, 24, 8], [8, 8, 16, 16], [24, 8, 32, 16]],
  body: [[28, 20, 32, 32], [16, 20, 20, 32], [20, 16, 28, 20], [28, 16, 36, 20], [20, 20, 28, 32], [32, 20, 40, 32]],
  arm: [[48, 20, 52, 32], [40, 20, 44, 32], [44, 16, 48, 20], [48, 16, 52, 20], [44, 20, 48, 32], [52, 20, 56, 32]],
  leg: [[4, 20, 8, 32], [0, 20, 4, 32], [4, 16, 8, 20], [8, 16, 12, 20], [4, 20, 8, 32], [8, 20, 12, 32]],
};

// Block sizes in pixels
const SIZE = {
  HEAD: 8,
  TORSO_H: 12,
  LIMB_H: 12,
  ARM_W: 4,
  LEG_W: 4,
  BODY_W: 8,
  BODY_D: 4,
  LIMB_D: 4,
};

// Create the full player model
export function createMinecraftPlayer(skinTextureUrl) {
  const group = new THREE.Group();
  const scale = 1 / 16;

  const texture = new THREE.TextureLoader().load(skinTextureUrl, (t) => {
    console.log('Skin loaded');
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
  });

  // Head
  const head = createSkinnedBox(8, 8, 8, texture, UVMaps.head);
  head.geometry.translate(0, -4, 0);
  const headGroup = new THREE.Group();
  headGroup.add(head);
  headGroup.position.set(0, 32, 0);

  // Body
  const body = createSkinnedBox(8, 12, 4, texture, UVMaps.body);
  body.geometry.translate(0, -6, 0);
  const bodyGroup = new THREE.Group();
  bodyGroup.add(body);
  bodyGroup.position.set(0, 24, 0);

  // Arms
  const leftArm = createSkinnedBox(4, 12, 4, texture, UVMaps.arm);
  leftArm.geometry.translate(0, -6, 0);
  const leftArmGroup = new THREE.Group();
  leftArmGroup.add(leftArm);
  leftArmGroup.position.set(-6, 24, 0);

  const rightArm = createSkinnedBox(4, 12, 4, texture, UVMaps.arm);
  rightArm.geometry.translate(0, -6, 0);
  const rightArmGroup = new THREE.Group();
  rightArmGroup.add(rightArm);
  rightArmGroup.position.set(6, 24, 0);

  // Legs
  const leftLeg = createSkinnedBox(4, 12, 4, texture, UVMaps.leg);
  leftLeg.geometry.translate(0, -6, 0);
  const leftLegGroup = new THREE.Group();
  leftLegGroup.add(leftLeg);
  leftLegGroup.position.set(-2, 12, 0);

  const rightLeg = createSkinnedBox(4, 12, 4, texture, UVMaps.leg);
  rightLeg.geometry.translate(0, -6, 0);
  const rightLegGroup = new THREE.Group();
  rightLegGroup.add(rightLeg);
  rightLegGroup.position.set(2, 12, 0);

  // Assemble
  group.add(headGroup, bodyGroup, leftArmGroup, rightArmGroup, leftLegGroup, rightLegGroup);
  group.scale.set(scale, scale, scale);
  group.parts = {
    head: headGroup,
    body: bodyGroup,
    leftArm: leftArmGroup,
    rightArm: rightArmGroup,
    leftLeg: leftLegGroup,
    rightLeg: rightLegGroup,
  };
  return group;
}
