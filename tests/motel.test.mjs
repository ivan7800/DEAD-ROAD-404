import test from 'node:test';import assert from 'node:assert/strict';
import {isNearTape,collectTape,motelCollision} from '../src/motel.ts';
import {fresh,normalizeSave} from '../src/state.ts';
test('motel tape proximity',()=>{assert.equal(isNearTape(-20,-45),true);assert.equal(isNearTape(0,0),false);});
test('motel has open front door but closed flank',()=>{assert.equal(motelCollision(-20,-41),false);assert.equal(motelCollision(-24,-45),true);});
test('motel supplies reward once',()=>{const first=collectTape(fresh());assert.equal(first.collected,true);assert.equal(first.parts,2);const second=collectTape(first);assert.equal(second.collected,false);assert.equal(second.parts,2);});
test('older version 2 saves migrate with no cassette',()=>{const old=fresh();delete old.motelTape;assert.equal(normalizeSave(old)?.motelTape,false);});
test('cassette persists',()=>{const s={...fresh(),motelTape:true};assert.equal(normalizeSave(s)?.motelTape,true);});
