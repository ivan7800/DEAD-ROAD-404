import test from 'node:test';
import assert from 'node:assert/strict';
import {MAX_STAMINA,stepStamina,canSprint,movementSpeed,explorationHint} from '../src/exploration.ts';
test('esprintar consume y caminar recupera resistencia',()=>{assert.equal(stepStamina(100,true,1/10),97.3);assert.equal(stepStamina(50,false,.1),51.8);});
test('resistencia limitada sin exceder umbrales',()=>{assert.equal(stepStamina(1,true,5),0);assert.equal(stepStamina(99,false,5),100);assert.equal(stepStamina(30,true,NaN),30);});
test('no permite correr sin movimiento o sin resistencia',()=>{assert.equal(canSprint(0,true,true),false);assert.equal(canSprint(80,false,true),false);assert.equal(canSprint(80,true,true),true);});
test('velocidad y ayudas de exploración estables',()=>{assert.ok(movementSpeed(true)>movementSpeed(false));assert.match(explorationHint('signal',true),/llave/);assert.match(explorationHint('key',false),/Vera/);});
