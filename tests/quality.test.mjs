import test from 'node:test';import assert from 'node:assert/strict';
import {graphicsPreset,nextGraphicsPreset,renderPixelRatio,GRAPHICS} from '../src/quality.ts';
test('arranque PSX aunque exista configuración gráfica antigua',()=>{
 assert.equal(graphicsPreset(null),'psx');assert.equal(graphicsPreset('invalid'),'psx');
});
test('todas las resoluciones usan PSX sin sombras',()=>{
 assert.equal(nextGraphicsPreset('psx'),'rendimiento');
 assert.equal(nextGraphicsPreset('rendimiento'),'equilibrado');
 assert.equal(nextGraphicsPreset('equilibrado'),'cine');
 assert.equal(nextGraphicsPreset('cine'),'psx');
 for(const p of Object.keys(GRAPHICS))assert.equal(GRAPHICS[p].shadows,false);
});
test('240p no supera 426x240 píxeles internos en Full HD ni 4K',()=>{
 for(const [w,h] of [[1280,800],[1920,1080],[3840,2160]]){
  const dpr=renderPixelRatio('psx',2,w,h);
  assert.ok(dpr>0);assert.ok(dpr*dpr*w*h<=426*240*1.01);
 }
});
test('presupuesto real de píxeles para los cuatro niveles PSX',()=>{
 for(const p of Object.keys(GRAPHICS)){
  const ratio=renderPixelRatio(p,3,3840,2160);
  assert.ok(ratio*ratio*3840*2160<=GRAPHICS[p].pixelBudget*1.01,p);
  assert.ok(renderPixelRatio(p,0)>=.5);
  assert.ok(renderPixelRatio(p,Number.NaN)>=.5);
 }
});
