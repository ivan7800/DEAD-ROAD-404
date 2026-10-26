import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraYawForMovement} from '../src/controlOrientation.ts';

// Three.js camera local forward is -Z. Rotating it by -yaw must match
// the exploration movement vector (+sin(yaw), -cos(yaw)).
test('W walks in the direction the first-person camera faces at all headings',()=>{
 for(const yaw of [0,Math.PI/6,Math.PI/2,Math.PI,Math.PI*1.5,-Math.PI/3]){
  const cameraYaw=cameraYawForMovement(yaw);
  const cameraForward={x:-Math.sin(cameraYaw),z:-Math.cos(cameraYaw)};
  const playerForward={x:Math.sin(yaw),z:-Math.cos(yaw)};
  assert.ok(Math.abs(cameraForward.x-playerForward.x)<1e-10,'X direction differs');
  assert.ok(Math.abs(cameraForward.z-playerForward.z)<1e-10,'Z direction differs');
 }
});
