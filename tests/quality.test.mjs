import test from 'node:test';import assert from 'node:assert/strict';
import {graphicsPreset,nextGraphicsPreset,renderPixelRatio,GRAPHICS} from '../src/quality.ts';
test('ajustes gráficos desconocidos no rompen la carga',()=>{assert.equal(graphicsPreset(null),'equilibrado');assert.equal(graphicsPreset('invalid'),'equilibrado');});
test('selector de calidad recorre tres opciones',()=>{assert.equal(nextGraphicsPreset('rendimiento'),'equilibrado');assert.equal(nextGraphicsPreset('equilibrado'),'cine');assert.equal(nextGraphicsPreset('cine'),'rendimiento');});
test('densidad de píxeles limitada en cualquier preset',()=>{for(const p of Object.keys(GRAPHICS)){assert.ok(renderPixelRatio(p,3)<=2);assert.ok(renderPixelRatio(p,0)>=.5);assert.ok(renderPixelRatio(p,Number.NaN)>=.5);}});
test('modo rendimiento reduce coste: sombras y ratio',()=>{assert.equal(GRAPHICS.rendimiento.shadows,false);assert.ok(GRAPHICS.rendimiento.pixelRatio<GRAPHICS.cine.pixelRatio);assert.ok(GRAPHICS.cine.shadowSize>=GRAPHICS.equilibrado.shadowSize);});

test('DPR limitado en HiDPI: equilibrado no dibuja cuatro veces más píxeles',()=>{
 assert.equal(renderPixelRatio('equilibrado',2,1920,1080),1);
 assert.ok(renderPixelRatio('rendimiento',2,1920,1080)<=.72);
 assert.ok(renderPixelRatio('cine',2,1920,1080)<=1.35);
});
test('presupuesto de píxeles limita las ventanas 4K',()=>{
 for(const preset of Object.keys(GRAPHICS)){
  const ratio=renderPixelRatio(preset,2,3840,2160);
  assert.ok(ratio*ratio*3840*2160<=GRAPHICS[preset].pixelBudget*1.05,preset);
 }
});
