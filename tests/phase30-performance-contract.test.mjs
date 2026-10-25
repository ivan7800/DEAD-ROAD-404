import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('linterna reutiliza un vector estable sin instanciarlo en el bucle',()=>{
 const world=read('src/scene.ts');
 const start=world.indexOf('setFlashlight(active:boolean');
 const end=world.indexOf('flashDanger()',start);
 assert.ok(start>0&&end>start);
 const fn=world.slice(start,end);
 assert.match(world,/flashlightDirection=new THREE\.Vector3\(\)/);
 assert.match(fn,/this\.flashlightDirection\.set\(/);
 assert.doesNotMatch(fn,/new THREE\.Vector3\(/);
});
test('menú no recalcula matrices de proyección sin variar el FOV',()=>{
 const main=read('src/main.ts');
 assert.match(main,/if\(world\.camera\.fov!==73\)\{world\.camera\.fov=73;world\.camera\.updateProjectionMatrix\(\);\}/);
 assert.match(main,/MAP_CAMERA_POSITION/);
 assert.match(main,/FUEL_CAN_CHECK_POSITION/);
 assert.match(main,/if\(\$\('stats'\)\.textContent!==text\)/);
});
test('partículas PSX omiten el cálculo de feedback cuando no se dibujan',()=>{
 const dust=read('src/driveDust.ts');
 const pos=dust.indexOf("if(this.preset==='psx'||this.preset==='rendimiento')");
 const feedback=dust.indexOf('const feedback=driveFeedback(');
 assert.ok(pos>0&&feedback>pos,'El retorno anticipado debe preceder al cálculo');
});
test('el benchmark es sintácticamente válido y no realiza peticiones de telemetría',()=>{
 execFileSync(process.execPath,['--check',new URL('../scripts/benchmark-gpu.mjs',import.meta.url).pathname],{stdio:'pipe'});
 const script=read('scripts/benchmark-gpu.mjs');
 assert.match(script,/requestAnimationFrame/);
 assert.match(script,/WEBGL_debug_renderer_info/);
 assert.match(script,/artifacts','benchmarks/);
 assert.doesNotMatch(script,/fetch\('https:\/\//);
});
