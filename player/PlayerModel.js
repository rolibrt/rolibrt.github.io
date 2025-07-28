import * as THREE from 'three';

export function createMinecraftPlayer() {
  const player = new THREE.Group();
  const scale = 1 / 24;

  // Materials (different color per part)
  const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 });   // Yellow
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x3399ff });   // Blue
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0x996633 });    // Brown
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });    // Dark gray

  // === HEAD ===
  const head = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 8), headMaterial);
  head.geometry.translate(0, -4, 0); // Rotate around top
  const headGroup = new THREE.Group();
  headGroup.add(head);
  headGroup.position.set(0, 26, 0); // Top of head at Y=28

  // === BODY (TORSO) ===
  const body = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 4), bodyMaterial);
  body.geometry.translate(0, -6, 0); // Rotate from top
  const bodyGroup = new THREE.Group();
  bodyGroup.add(body);
  bodyGroup.position.set(0, 18, 0); // Top of torso at Y=24

  // === LEFT ARM ===
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(4, 12, 4), armMaterial);
  leftArm.geometry.translate(0, -6, 0); // Rotate from top
  const leftArmGroup = new THREE.Group();
  leftArmGroup.add(leftArm);
  leftArmGroup.position.set(-6, 18, 0); // Shoulder at Y=24

  // === RIGHT ARM ===
  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(4, 12, 4), armMaterial);
  rightArm.geometry.translate(0, -6, 0); // Rotate from top
  const rightArmGroup = new THREE.Group();
  rightArmGroup.add(rightArm);
  rightArmGroup.position.set(6, 18, 0); // Shoulder at Y=24

  // === LEFT LEG ===
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(4, 12, 4), legMaterial);
  leftLeg.geometry.translate(0, -6, 0); // Rotate from top
  const leftLegGroup = new THREE.Group();
  leftLegGroup.add(leftLeg);
  leftLegGroup.position.set(-2, 6, 0); // Top of leg at Y=12

  // === RIGHT LEG ===
  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(4, 12, 4), legMaterial);
  rightLeg.geometry.translate(0, -6, 0); // Rotate from top
  const rightLegGroup = new THREE.Group();
  rightLegGroup.add(rightLeg);
  rightLegGroup.position.set(2, 6, 0); // Top of leg at Y=12

  // === Assemble Player ===
  player.add(
    headGroup,
    bodyGroup,
    leftArmGroup,
    rightArmGroup,
    leftLegGroup,
    rightLegGroup
  );

  // Scale to Minecraft units (1 block = 1 unit)
  player.scale.set(scale, scale, scale);

  return {
    object: player,
    parts: {
      head: headGroup,
      body: bodyGroup,
      leftArm: leftArmGroup,
      rightArm: rightArmGroup,
      leftLeg: leftLegGroup,
      rightLeg: rightLegGroup,
    },
  };
}