import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const load=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('THE LAST LIGHT tiene acceso real en el mapa, no un enlace vacío',()=>{
 const html=load('index.html'),main=load('src/main.ts');
 assert.match(html,/<button id="diner"[^>]*disabled/);
 assert.match(main,/\$\('diner'\)\.addEventListener\('click'/);
 assert.match(main,/state=beginDiner\(state\)/);
 assert.match(main,/inDiner=true/);
});
test('el renderer PSX incorpora un nuevo escenario procedural y enemigo interactivo',()=>{
 const scene=load('src/scene.ts'),diner=load('src/dinerScene.ts');
 assert.match(scene,/readonly diner=new DinerScene\(\)/);
 assert.match(scene,/setDinerVisible\(visible:boolean\)/);
 assert.match(scene,/setDinerThreat\(x:number/);
 assert.match(diner,/class DinerScene/);
 assert.match(diner,/TH[E_]_LAST_LIGHT_1992|THE_LAST_LIGHT_1992/);
 assert.doesNotMatch(diner,/GLTFLoader|\.glb/);
});
test('los controles separan enemigos y colisiones según localización',()=>{
 const main=load('src/main.ts');
 assert.match(main,/inDiner\?dinerCollision:motelCollision/);
 assert.match(main,/strikeDinerThreat\(/);
 assert.match(main,/stepDinerThreat\(/);
 assert.match(main,/world\.setEnemy\(enemy\.x,enemy\.z,false,elapsed\)/);
});
