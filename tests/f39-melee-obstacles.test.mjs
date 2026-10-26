import test from 'node:test';
import assert from 'node:assert/strict';
import {strike,createEnemy} from '../src/combat.ts';

test('F39: melee attack cannot pass through the station wall',()=>{
 const enemy={...createEnemy(),x:9,z:0,health:75,alive:true};
 const hit=strike(enemy,7,0,25,Math.PI/2);
 assert.equal(hit.hit,false);
 assert.equal(hit.enemy.health,75);
});

test('F39: melee attack succeeds at clear range when facing the target',()=>{
 const enemy={...createEnemy(),x:6,z:5,health:75,alive:true};
 const hit=strike(enemy,5,5,25,Math.PI/2);
 assert.equal(hit.hit,true);
 assert.equal(hit.enemy.health,50);
});

test('F39: melee attack misses when the target is behind the player',()=>{
 const enemy={...createEnemy(),x:6,z:5,health:75,alive:true};
 const hit=strike(enemy,5,5,25,-Math.PI/2);
 assert.equal(hit.hit,false);
});
