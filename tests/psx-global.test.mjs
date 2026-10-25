import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const src=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('PSX no hace solicitudes GLB al construir el escenario',()=>{
 const scene=src('src/scene.ts');
 const constructor=scene.split('constructor(canvas:HTMLCanvasElement){')[1].split('async initArtAssets()')[0];
 assert.doesNotMatch(constructor,/this\.initArtAssets\(/);
 assert.match(scene,/this\.firebird\.setRetro\(true\)/);
 assert.match(scene,/this\.artStatus='psx'/);
});
test('escenario low-poly, sin sombras ni posprocesado',()=>{
 const scene=src('src/scene.ts'),css=src('src/style.css');
 assert.match(scene,/THREE\.NoToneMapping/);
 assert.match(scene,/this\.camera\.far=88/);
 assert.match(scene,/o instanceof THREE\.PointLight\)o\.visible=false/);
 assert.match(css,/html\.psx-mode #scene\{image-rendering:pixelated/);
});
test('Firebird retro propio con ruedas octagonales',()=>{
 const retro=src('src/retroCar.ts'),v=src('src/vehicle.ts');
 assert.match(retro,/CylinderGeometry\(\.48,\.48,\.22,8\)/);
 assert.match(v,/setRetro\(enabled:boolean\)/);
});
test('no sobrescribe partidas y usa nueva preferencia de gráficos',()=>{
 const main=src('src/main.ts');
 assert.match(main,/dead-road-404-f19-v2/);
 assert.match(main,/dead-road-404-psx-graphics/);
 assert.doesNotMatch(main,/getItem\('dead-road-404-graphics'\)/);
});
