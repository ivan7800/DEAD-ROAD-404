import test from 'node:test';import assert from 'node:assert/strict';
import {AdaptiveQuality} from '../src/adaptiveQuality.ts';
test('el escalado adaptativo no cambia con un tirón aislado',()=>{
 const a=new AdaptiveQuality();
 assert.equal(a.observe(20000,25,120,true,'cine'),null);
 assert.equal(a.observe(21500,60,120,true,'cine'),null);
 assert.equal(a.observe(22500,20,120,true,'cine'),null);
});
test('caída sostenida durante cinco segundos reduce calidad',()=>{
 const a=new AdaptiveQuality();assert.equal(a.observe(20000,25,120,true,'cine'),null);
 assert.equal(a.observe(24999,24,120,true,'cine'),null);
 assert.equal(a.observe(25000,24,120,true,'cine'),'equilibrado');
 assert.equal(a.observe(31000,22,120,true,'equilibrado'),null);
 assert.equal(a.observe(35000,22,120,true,'equilibrado'),null);
 assert.equal(a.observe(40000,22,120,true,'equilibrado'),'rendimiento');
});
test('sin GPU lista, pestaña oculta o muestras insuficientes no se reduce calidad',()=>{
 const a=new AdaptiveQuality();
 assert.equal(a.observe(10000,8,50,true,'equilibrado'),null);
 assert.equal(a.observe(20000,8,120,false,'equilibrado'),null);
 assert.equal(a.observe(30000,25,120,true,'rendimiento'),null);
});
test('elección manual G mantiene el ajuste 20 segundos',()=>{
 const a=new AdaptiveQuality();a.defer(10000);
 assert.equal(a.observe(15000,20,120,true,'cine'),null);
 assert.equal(a.observe(29000,20,120,true,'cine'),null);
 assert.equal(a.observe(30000,20,120,true,'cine'),null);
 assert.equal(a.observe(35000,20,120,true,'cine'),'equilibrado');
});
