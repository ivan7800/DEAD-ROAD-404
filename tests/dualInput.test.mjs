import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseAxis} from '../src/dualInput.ts';
test('keyboard takes priority over simultaneous opposite gamepad input',()=>{
 assert.equal(chooseAxis(1,-1),1);
 assert.equal(chooseAxis(-1,1),-1);
 assert.equal(chooseAxis(0,.48),.48);
 assert.equal(chooseAxis(0,0),0);
});
