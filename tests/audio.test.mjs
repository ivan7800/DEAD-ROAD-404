import test from 'node:test';import assert from 'node:assert/strict';
import {engineFrequency,soundMix} from '../src/audioMath.ts';
test('V8 simulado aumenta su frecuencia con la velocidad',()=>{assert.equal(engineFrequency(0),38);assert.ok(engineFrequency(18)>engineFrequency(2));assert.ok(engineFrequency(999)<=125);});
test('valores inválidos no generan frecuencias NaN',()=>{assert.equal(engineFrequency(Number.NaN),38);assert.equal(engineFrequency(Infinity),38);});
test('mezcla de audio acorde al modo de juego',()=>{assert.equal(soundMix('explore',0).engine,0);assert.ok(soundMix('drive',22).engine>soundMix('drive',0).engine);assert.ok(soundMix('explore',0).tension>soundMix('map',0).tension);});
