import test from 'node:test';import assert from 'node:assert/strict';
import {roadEdgeImpact,repairVehicle} from '../src/vehicleWear.ts';
import {fresh,normalizeSave} from '../src/state.ts';
test('impacto a gran velocidad reduce condición y velocidad',()=>{
 const r=roadEdgeImpact({condition:100,cooldown:0},18,true,.016);
 assert.ok(r.hit&&r.condition<100&&r.speed<18);
});
test('sin repetición de daño hasta pasar enfriamiento',()=>{
 const r=roadEdgeImpact({condition:76,cooldown:1},20,true,.016);
 assert.equal(r.hit,false);assert.equal(r.condition,76);
 assert.equal(roadEdgeImpact({condition:76,cooldown:0},3,true,.016).condition,76);
});
test('reparación requiere pieza y devuelve como máximo 100',()=>{
 const s={...fresh(),carCondition:80,parts:2},r=repairVehicle(s);
 assert.equal(r.carCondition,100);assert.equal(r.parts,1);
});
test('guardado anterior sin integridad recupera 100',()=>{
 const s={...fresh(),carCondition:12,parts:0};assert.equal(repairVehicle(s).carCondition,12);
 const old=fresh();delete old.carCondition;assert.equal(normalizeSave(old)?.carCondition,100);
});
