import test from 'node:test';
import assert from 'node:assert/strict';
import {stick,readPad} from '../src/gamepadControls.ts';
import {normalizePulpSettings,parsePulpSettings} from '../src/ui/pulpSettings.ts';
test('gamepad deadzone keeps drift at rest and allows real input',()=>{
 assert.equal(stick(.18,.25),0);
 assert.ok(stick(.18,.05)>0);
 assert.equal(stick(1,.4),1);
 assert.equal(stick(-1,.4),-1);
});
test('gamepad deadzone is saved and clamped',()=>{
 assert.equal(normalizePulpSettings({gamepadDeadzone:99}).gamepadDeadzone,40);
 assert.equal(normalizePulpSettings({gamepadDeadzone:0}).gamepadDeadzone,5);
 assert.equal(parsePulpSettings('{}').gamepadDeadzone,16);
 assert.equal(parsePulpSettings('{"gamepadDeadzone":28}').gamepadDeadzone,28);
});
test('controller polling uses selected deadzone',()=>{
 const pad={mapping:'standard',axes:[.15,-.15,.15,0],buttons:[]};
 assert.equal(readPad(pad,.25).forward,0);
 assert.ok(readPad(pad,.05).forward>0);
});
