import test from 'node:test';
import assert from 'node:assert/strict';
import {walkWithSlide,STATION_COLLIDERS} from '../src/worldCollision.ts';
test('F39: station walls block their own map',()=>{
 const p=walkWithSlide(6,0,4,0);
 assert.ok(p.x<7.35,'player must stop before station facade');
});
test('F39: unrelated chapter has no phantom station walls',()=>{
 const p=walkWithSlide(6,0,4,0,()=>false,[]);
 assert.ok(Math.abs(p.x-10)<.001,'player crosses same coordinates on another level');
});
test('F39: chapter-specific external walls remain effective',()=>{
 const wall=(x,z)=>x>7.2;
 const p=walkWithSlide(6,0,4,0,wall,[]);
 assert.ok(p.x<=7.2,'external collider must block player');
});
test('F39: legacy callers retain station collision map',()=>{
 assert.ok(STATION_COLLIDERS.length>0);
 const x=walkWithSlide(6,0,4,0,()=>false);
 assert.ok(x.x<7.35);
});
