import * as THREE from 'three';
import { atlasTexture } from '../atlas';

export function createMeshFromGeometry([opaque, transparent]) {
  const opaqueGeometry = new THREE.BufferGeometry();
  opaqueGeometry.setAttribute('position', new THREE.Int16BufferAttribute(opaque.positions, 3));
  opaqueGeometry.setAttribute('normal', new THREE.Int16BufferAttribute(opaque.normals, 3));
  opaqueGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(opaque.uvs, 2));
  opaqueGeometry.setIndex(opaque.indices);
  const opaqueMaterial = new THREE.MeshLambertMaterial({
    map: atlasTexture,
    side: THREE.BackSide
  });

  const transparentGeometry = new THREE.BufferGeometry();
  transparentGeometry.setAttribute('position', new THREE.Float32BufferAttribute(transparent.positions, 3));
  transparentGeometry.setAttribute('normal', new THREE.Int16BufferAttribute(transparent.normals, 3));
  transparentGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(transparent.uvs, 2));
  transparentGeometry.setIndex(transparent.indices);
  const transparentMaterial = new THREE.MeshLambertMaterial({
    map: atlasTexture,
    transparent: true,
    alphaTest: 0.5,
    side: THREE.BackSide
  });
  return [new THREE.Mesh(opaqueGeometry, opaqueMaterial), new THREE.Mesh(transparentGeometry, transparentMaterial)];
}