import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html'),main=read('src/main.ts');
test('nuevo capítulo IV tiene acceso desde el menú, sin enlace muerto',()=>{
 assert.match(html,/id="radio"[^>]*disabled/);
 assert.match(main,/\$\('radio'\)\.addEventListener\('click'/);
 assert.match(main,/state=beginRadio\(state\)/);
 assert.match(main,/world\.setRadioVisible/);
});
test('WXR-404 es una localización PSX original, con superficie y subsuelo',()=>{
 const scene=read('src/scene.ts'),radio=read('src/radioScene.ts');
 assert.match(scene,/readonly radio=new RadioScene\(\)/);
 assert.match(radio,/UMBRA_UNDERGROUND|UMBRAL_UNDERGROUND/);
 assert.match(scene,/setRadioUnderground\(value:boolean\)/);
 assert.match(scene,/legacyEnvironment\.visible=!visible/);
 assert.doesNotMatch(radio,/GLTFLoader|\.glb/);
});
test('las interacciones físicas y la IA no se mezclan con el pueblo',()=>{
 assert.match(main,/inRadio\?radioCollision:inTown\?townCollision/);
 assert.match(main,/strikeRadioOperator\(/);
 assert.match(main,/updateRadioOperator\(/);
 assert.match(main,/radioUnderground=true/);
 assert.match(main,/radioUnderground=false/);
});
test('F24 se conserva: cartelas, pausa y archivo de capítulos integran IV',()=>{
 const theme=read('src/ui/pulpSettings.ts');
 assert.match(theme,/FRECUENCIA MUERTA/);
 assert.match(main,/pulpUi\?\.title\('CAPÍTULO IV/);
 assert.match(main,/if\(visible&&!paused&&\(interactive\|\|draw\)\)update\(dt\)/);
});
