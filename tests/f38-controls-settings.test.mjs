import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_PULP_SETTINGS,normalizePulpSettings,parsePulpSettings} from '../src/ui/pulpSettings.ts';
test('F38 default camera controls retain prior movement',()=>{
 assert.equal(DEFAULT_PULP_SETTINGS.mouseSensitivity,100);
 assert.equal(DEFAULT_PULP_SETTINGS.gamepadSensitivity,100);
 assert.equal(DEFAULT_PULP_SETTINGS.invertY,false);
});
test('F38 camera preferences clamp and ignore malformed values',()=>{
 const p=normalizePulpSettings({mouseSensitivity:1000,gamepadSensitivity:-4,invertY:true});
 assert.equal(p.mouseSensitivity,200);assert.equal(p.gamepadSensitivity,25);assert.equal(p.invertY,true);
 const broken=normalizePulpSettings({mouseSensitivity:'500',gamepadSensitivity:Infinity,invertY:'true'});
 assert.equal(broken.mouseSensitivity,100);assert.equal(broken.gamepadSensitivity,100);assert.equal(broken.invertY,false);
});
test('F38 saved settings survive JSON serialization and older saves',()=>{
 const saved=normalizePulpSettings({mouseSensitivity:135,gamepadSensitivity:65,invertY:true});
 const loaded=parsePulpSettings(JSON.stringify(saved));
 assert.equal(loaded.mouseSensitivity,135);assert.equal(loaded.gamepadSensitivity,65);assert.equal(loaded.invertY,true);
 assert.equal(parsePulpSettings('{"volume":70}').mouseSensitivity,100);
});
