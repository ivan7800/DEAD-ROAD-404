import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('los GLB estáticos agrupan mallas y no dibujan sombras por cada tornillo',()=>{
 const src=read('src/artAssets.ts');
 assert.match(src,/batchStaticModel\(gltf\.scene\)/);
 assert.match(src,/node\.castShadow=false/);
 assert.doesNotMatch(src,/node\.castShadow=true/);
});
test('presupuesto de framebuffer actualizado al redimensionar',()=>{
 const scene=read('src/scene.ts');
 assert.match(scene,/renderPixelRatio\(this\.graphicsPreset,window\.devicePixelRatio\|\|1,w,h\)/);
});
test('el control adaptativo se activa solamente con modelos y pestaña visible',()=>{
 const main=read('src/main.ts');
 assert.match(main,/adaptiveQuality\.observe/);assert.match(main,/!document\.hidden/);
 assert.match(main,/metrics\.reset\(\);writePreference/);
});
