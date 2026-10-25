import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('existe botón del pueblo activado por progreso y capítulo real',()=>{
 const m=read('src/main.ts'),html=read('index.html');
 assert.match(html,/id="town"/);assert.match(m,/\$\('town'\)\.addEventListener\('click'/);
 assert.match(m,/state=beginTown\(state\)/);
 assert.match(m,/canEnterTown\(state\)/);
});
test('renderizador mantiene la estética PSX sin nuevos GLB externos',()=>{
 const scene=read('src/scene.ts'),town=read('src/townScene.ts');
 assert.match(scene,/readonly town=new TownScene\(\)/);
 assert.match(scene,/setTownVisible\(visible:boolean\)/);
 assert.match(town,/EL_PUEBLO_SIN_NOMBRE_PSX/);
 assert.doesNotMatch(town,/GLTFLoader|\.glb/);
});
test('enemigos y colisiones se aíslan entre tres mundos',()=>{
 const m=read('src/main.ts');
 assert.match(m,/inTown\?townCollision:inDiner\?dinerCollision:motelCollision/);
 assert.match(m,/strikeGuardian\(/);assert.match(m,/updateGuardian\(/);
 assert.match(m,/world\.setTownGuardian\(/);
});
