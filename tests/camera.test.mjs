import test from 'node:test';import assert from 'node:assert/strict';import {validCamera,nextCamera,CAMERA_MODES,CAMERA_LABELS} from '../src/cameraModes.ts';
test('selector recorre cuatro cámaras',()=>{let c=validCamera(null);for(let i=0;i<4;i++)c=nextCamera(c);assert.equal(c,'chase');});
test('persistencia valida entradas',()=>{assert.equal(validCamera('cockpit'),'cockpit');assert.equal(validCamera('malicious'),'chase');});
test('cámaras tienen nombres',()=>{assert.equal(CAMERA_MODES.length,4);for(const c of CAMERA_MODES)assert.ok(CAMERA_LABELS[c]);});
