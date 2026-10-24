import test from 'node:test';import assert from 'node:assert/strict';
import {createEnemy,updateEnemy,strike,distance} from '../src/combat.ts';
test('enemy approaches nearby player',()=>{const a=createEnemy();const b=updateEnemy(a,17,-4,.1);assert.ok(distance(b.enemy.x,b.enemy.z,17,-4)<2);assert.equal(b.alert,true)});
test('enemy does not detect distant player',()=>{assert.equal(updateEnemy(createEnemy(),100,100,.1).alert,false)});
test('enemy attack obeys cooldown',()=>{let a=createEnemy();let r=updateEnemy(a,17,-6,.05);assert.equal(r.hit,true);assert.equal(updateEnemy(r.enemy,17,-6,.05).hit,false)});
test('melee requires proximity',()=>{const r=strike(createEnemy(),-30,-30);assert.equal(r.hit,false)});
test('melee defeat persists and is non-negative',()=>{let e=createEnemy();for(let i=0;i<4;i++)e=strike(e,e.x,e.z+1.2).enemy;assert.equal(e.alive,false);assert.equal(e.health,0);assert.equal(strike(e,17,-6).hit,false)});
test('enemy update clamps frame delta',()=>{let a=createEnemy();let b=updateEnemy(a,17,0,500);assert.ok(distance(a.x,a.z,b.enemy.x,b.enemy.z)<.5)});

test('health can serialize across a saved run',async()=>{const {normalizeSave,fresh}=await import('../src/state.ts');const stored={...fresh(),enemyHealth:0};assert.equal(normalizeSave(stored)?.enemyHealth,0);const legacy={...fresh()};delete legacy.enemyHealth;assert.equal(normalizeSave(legacy)?.enemyHealth,75)});
