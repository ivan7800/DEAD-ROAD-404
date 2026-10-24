import test from 'node:test';
import assert from 'node:assert/strict';
import {createEnemy,updateEnemy,strike,blocked,clearSight} from '../src/combat.ts';
test('pared de la tienda bloquea vision',()=>assert.equal(clearSight(12,-1,12,3),false));
test('pasillo central permite vision',()=>assert.equal(clearSight(15,.2,15,2.5),true));
test('enemigo no atraviesa obstaculos',()=>{let e=createEnemy();for(let i=0;i<200;i++){e=updateEnemy(e,10,-5,.05).enemy;assert.equal(blocked(e.x,e.z),false);}});
test('ataque orientado: no golpea por la espalda',()=>{const e={...createEnemy(),x:0,z:-2};assert.equal(strike(e,0,0,25,Math.PI).hit,false);assert.equal(strike(e,0,0,25,0).hit,true);});
test('retroceso aplica tiempo de aturdimiento',()=>{const e={...createEnemy(),x:0,z:-2};const h=strike(e,0,0,25,0);assert.ok((h.enemy.stagger??0)>0);const next=updateEnemy(h.enemy,0,0,.05);assert.equal(next.hit,false);});
