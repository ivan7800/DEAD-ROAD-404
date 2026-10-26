import test from 'node:test';
import assert from 'node:assert/strict';
import {stick,readPad} from '../src/gamepadControls.ts';
const b=pressed=>({pressed});
const pad=(axes,pressed=[])=>({mapping:'standard',axes,buttons:Array.from({length:17},(_,i)=>b(pressed.includes(i)))});
test('dead zone filters drift and analog sticks preserve sign',()=>{
 assert.equal(stick(.08),0);
 assert.equal(stick(-.15),0);
 assert.equal(stick(1),1);
 assert.equal(stick(-1),-1);
 assert.ok(stick(.5)>0 && stick(.5)<1);
});
test('gamepad left stick moves ahead and sideways, right stick looks',()=>{
 const result=readPad(pad([.5,-1,.5,-.5]));
 assert.equal(result.forward,1);
 assert.ok(result.strafe>0);
 assert.ok(result.lookX>0);
 assert.ok(result.lookY<0);
});
test('gamepad buttons have deterministic actions and disconnect is idle',()=>{
 const v=readPad(pad([0,0,0,0],[0,2,3,4,8,9]));
 for(const key of ['e','f','t','i','escape'])assert.ok(v.buttons.has(key));
 assert.equal(v.sprint,true);
 const idle=readPad(null);
 assert.equal(idle.forward,0);
 assert.equal(idle.buttons.size,0);
 assert.equal(readPad({...pad([0,-1,0,0]),mapping:'nonstandard'}).forward,0);
});
