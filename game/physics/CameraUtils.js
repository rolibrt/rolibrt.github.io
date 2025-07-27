import * as THREE from 'three';
export function getRotation(camera) {
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    const yaw = THREE.MathUtils.radToDeg(euler.y);   // rotation around Y axis
    const pitch = THREE.MathUtils.radToDeg(euler.x); // rotation around X axis
    return { yaw, pitch };
}

export function setRotation(camera, yaw, pitch) {
    const yawRad = THREE.MathUtils.degToRad(yaw);   // Turn left
    const pitchRad = THREE.MathUtils.degToRad(pitch); // Look up
    const euler = new THREE.Euler(pitchRad, yawRad, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);
}