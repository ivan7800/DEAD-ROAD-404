import {test} from 'node:test';import {strict as assert} from 'node:assert';
import {advanceMission,missionObjective,normalizeMission,INITIAL_MISSION,MISSION_CHOICES} from '../src/mission.ts';
import {fresh,normalizeSave} from '../src/state.ts';
test('mission sequence requires ordered interactions',()=>{let m={...INITIAL_MISSION};assert.equal(advanceMission(m,'key').stage,'arrival');m=advanceMission(m,'radio');assert.equal(m.stage,'signal');m=advanceMission(m,'key');assert.equal(m.stage,'key');m=advanceMission(m,'talk','rescue');assert.deepEqual(m,{stage:'resolved',choice:'rescue'});});
test('mission branches have unique choices',()=>assert.equal(new Set(MISSION_CHOICES.map(c=>c.id)).size,3));
test('completed mission cannot be farmed',()=>{const m={stage:'resolved',choice:'take'};assert.deepEqual(advanceMission(m,'talk','rescue'),m)});
test('invalid mission data resets safely',()=>assert.deepEqual(normalizeMission({stage:'resolved',choice:'hacked'}),INITIAL_MISSION));
test('older save loads with fresh quest without losing supplies',()=>{const old=fresh();delete old.mission;old.fuel=19;const s=normalizeSave(old);assert.equal(s.fuel,19);assert.equal(s.mission.stage,'arrival')});
test('objective reflects progress',()=>assert.match(missionObjective({stage:'key',choice:null}),/Vera/));
