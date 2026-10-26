import test from 'node:test';
import assert from 'node:assert/strict';
import {chapterAtmosphere35} from '../src/atmosphere35.ts';

test('F35: each chapter has a distinct, valid atmospheric palette',()=>{
 const chapters=Array.from({length:6},(_,i)=>chapterAtmosphere35(i+1));
 assert.equal(new Set(chapters.map(p=>p.fog)).size,6);
 assert.equal(new Set(chapters.map(p=>p.sky)).size,6);
 for(const p of chapters){
  for(const field of ['sky','fog','hemisphereSky','hemisphereGround','moonColor']){
   assert.ok(Number.isInteger(p[field])&&p[field]>=0&&p[field]<=0xffffff,field);
  }
  assert.ok(p.density>=.025&&p.density<=.045);
  assert.ok(p.ambientIntensity>=1&&p.ambientIntensity<=2.5);
  assert.ok(p.moonIntensity>=1&&p.moonIntensity<=2.5);
 }
});
test('F35: unexpected chapters safely use chapter one',()=>{
 for(const n of [0,-1,7,NaN,Infinity,1.5]){
  assert.strictEqual(chapterAtmosphere35(n),chapterAtmosphere35(1));
 }
});
