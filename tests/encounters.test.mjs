import test from 'node:test';import assert from 'node:assert/strict';import {fresh,normalizeSave,travel} from '../src/state.ts';import {resolveEncounter,shouldOfferEncounter} from '../src/encounters.ts';
test('encuentro se activa tras 24 km',()=>{assert.equal(shouldOfferEncounter(fresh()),false);assert.equal(shouldOfferEncounter(travel(fresh())),true)});
test('ayudar consume comida, cura y evita repetir premio',()=>{const s={...fresh(),km:24,health:70};const r=resolveEncounter(s,'help');assert.equal(r.food,12);assert.equal(r.health,80);assert.equal(resolveEncounter(r,'help').food,12)});
test('intercambiar consume pieza y recupera gasolina',()=>{const r=resolveEncounter(fresh(),'trade');assert.equal(r.parts,0);assert.equal(r.fuel,56)});
test('sin recursos no se resuelve ni cobra',()=>{const s={...fresh(),food:1,parts:0};assert.equal(resolveEncounter(s,'help').encounterResolved,false);assert.equal(resolveEncounter(s,'trade').encounterResolved,false)});
test('huir resuelve y persiste en guardado',()=>{const r=resolveEncounter(fresh(),'leave');assert.equal(normalizeSave(JSON.parse(JSON.stringify(r)))?.encounterResolved,true)});
test('carga partidas anteriores sin campo nuevo',()=>{const old=fresh();delete old.encounterResolved;assert.equal(normalizeSave(old)?.encounterResolved,false)});
