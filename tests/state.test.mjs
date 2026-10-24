import test from 'node:test';import assert from 'node:assert/strict';import {fresh,travel,pickFuel,normalizeSave,clamp} from '../src/state.ts';
test('partida inicial independiente',()=>{const a=fresh(),b=fresh();a.food=0;assert.equal(b.food,14);assert.equal(b.version,2)});
test('viajar consume comida y combustible',()=>{let s=travel(fresh());assert.equal(s.km,24);assert.equal(s.food,13);assert.ok(s.fuel<44)});
test('sin combustible no hay viaje',()=>{let s=fresh();s.fuel=0;let r=travel(s);assert.equal(r.km,0);assert.match(r.message,/combustible/)});
test('bidón solo se recoge una vez',()=>{let a=pickFuel(fresh()),b=pickFuel(a);assert.equal(a.fuel,72);assert.equal(b.fuel,72);assert.equal(b.parts,2)});
test('la salud cae al viajar sin comida',()=>{let s=fresh();s.food=0;assert.equal(travel(s).health,96)});
test('rechaza partidas incompatibles y malformadas',()=>{assert.equal(normalizeSave({version:1}),null);assert.equal(normalizeSave({version:2,mode:'map',fuel:Infinity}),null);assert.equal(normalizeSave(null),null)});
test('recupera guardado válido y acota recursos',()=>{let s=fresh();s.fuel=500;s.health=-30;let r=normalizeSave(JSON.parse(JSON.stringify(s)));assert.equal(r?.fuel,80);assert.equal(r?.health,0)});
test('clamp acota valores',()=>{assert.equal(clamp(-4,0,10),0);assert.equal(clamp(14,0,10),10)});
