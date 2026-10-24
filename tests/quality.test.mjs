import test from 'node:test';import assert from 'node:assert/strict';
import {graphicsPreset,nextGraphicsPreset,renderPixelRatio,GRAPHICS} from '../src/quality.ts';
test('ajustes gráficos desconocidos no rompen la carga',()=>{assert.equal(graphicsPreset(null),'equilibrado');assert.equal(graphicsPreset('invalid'),'equilibrado');});
test('selector de calidad recorre tres opciones',()=>{assert.equal(nextGraphicsPreset('rendimiento'),'equilibrado');assert.equal(nextGraphicsPreset('equilibrado'),'cine');assert.equal(nextGraphicsPreset('cine'),'rendimiento');});
test('densidad de píxeles limitada en cualquier preset',()=>{for(const p of Object.keys(GRAPHICS)){assert.ok(renderPixelRatio(p,3)<=2);assert.ok(renderPixelRatio(p,0)>=.5);assert.ok(renderPixelRatio(p,Number.NaN)>=.5);}});
test('modo rendimiento reduce coste: sombras y ratio',()=>{assert.equal(GRAPHICS.rendimiento.shadows,false);assert.ok(GRAPHICS.rendimiento.pixelRatio<GRAPHICS.cine.pixelRatio);assert.ok(GRAPHICS.cine.shadowSize>=GRAPHICS.equilibrado.shadowSize);});
