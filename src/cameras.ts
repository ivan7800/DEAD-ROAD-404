import * as THREE from 'three';
import type {CameraMode} from './cameraModes.ts';
const offset:Record<CameraMode,THREE.Vector3>={chase:new THREE.Vector3(0,3.6,8.8),hood:new THREE.Vector3(0,1.28,-1.80),cockpit:new THREE.Vector3(-.50,1.69,.28),front:new THREE.Vector3(0,2.55,-10)};
const look:Record<CameraMode,THREE.Vector3>={chase:new THREE.Vector3(0,1.15,-5),hood:new THREE.Vector3(0,1.25,-25),cockpit:new THREE.Vector3(-.50,1.55,-24),front:new THREE.Vector3(0,1.1,0)};
export function updateDrivingCamera(camera:THREE.PerspectiveCamera,car:THREE.Object3D,mode:CameraMode,dt:number,instant=false){const target=car.localToWorld(offset[mode].clone());const point=car.localToWorld(look[mode].clone());const t=instant?1:1-Math.exp(-Math.max(0,dt)*(mode==='chase'?5:12));camera.position.lerp(target,t);camera.lookAt(point);camera.fov=mode==='cockpit'?76:mode==='hood'?78:70;camera.updateProjectionMatrix();}
