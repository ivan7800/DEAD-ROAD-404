import test from 'node:test';import assert from 'node:assert/strict';
import {AdaptiveQuality} from '../src/adaptiveQuality.ts';
test('en modo PSX no puede degradar más',()=>{
 const a=new AdaptiveQuality();assert.equal(a.observe(50000,12,120,true,'psx'),null);
});
test('degradación progresiva después de cinco segundos',()=>{
 const a=new AdaptiveQuality();assert.equal(a.observe(20000,25,120,true,'cine'),null);
 assert.equal(a.observe(25000,25,120,true,'cine'),'equilibrado');
 assert.equal(a.observe(35000,23,120,true,'equilibrado'),null);
 assert.equal(a.observe(40000,23,120,true,'equilibrado'),'rendimiento');
 assert.equal(a.observe(50000,23,120,true,'rendimiento'),null);
 assert.equal(a.observe(55000,23,120,true,'rendimiento'),'psx');
});
test('sin caídas persistentes ni después de selección manual',()=>{
 const a=new AdaptiveQuality();a.defer(10000);
 assert.equal(a.observe(29000,20,120,true,'cine'),null);
 assert.equal(a.observe(35000,20,120,true,'cine'),null);
 assert.equal(a.observe(36000,60,120,true,'cine'),null);
});
