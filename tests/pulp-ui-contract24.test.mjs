import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html'),main=read('src/main.ts'),ui=read('src/ui/pulpUI.ts'),css=read('src/ui/pulp.css');
test('menú de medianoche, portada y pantallas tienen estructura semántica',()=>{
 for(const id of ['pulp-intro','pulp-transition','pulp-options','pulp-pause',
  'pulp-chapters','pulp-credits','pulp-pause-access',
  'pulp-options-open','pulp-chapters-open','pulp-credits-open']){
  assert.match(html,new RegExp('id="'+id+'"'),id);
 }
 assert.match(html,/role="dialog" aria-modal="true"/);
 assert.match(css,/MIDNIGHT MATINEE/);
 assert.match(css,/font-family:Impact|Impact/);
});
test('botones reales tienen listeners y navegación por teclado',()=>{
 assert.match(ui,/pulp-options-open.*addEventListener\('click'/);
 assert.match(ui,/pulp-chapters-open.*addEventListener\('click'/);
 assert.match(ui,/pulp-pause-save.*addEventListener\('click'/);
 assert.match(ui,/pulp-pause-load.*addEventListener\('click'/);
 assert.match(ui,/pulp-menu-from-pause.*addEventListener\('click'/);
 assert.match(ui,/e\.key==='Escape'/);
 assert.match(ui,/e\.key==='Tab'/);
 assert.match(ui,/stopImmediatePropagation/);
});
test('escenas se congelan al pausar y el modo rendimiento sigue PSX',()=>{
 assert.match(main,/if\(visible&&!paused&&\(interactive\|\|draw\)\)update\(dt\)/);
 assert.match(main,/pulpUi\?\.togglePause\(\)/);
 assert.match(main,/interactive&&world\.artStatus==='psx'/);
 assert.match(main,/world\.setGraphics\(preset\)/);
});
test('cambio de modo emite cartelas sin consumir escenas GLB',()=>{
 assert.match(main,/titleForLocation\(next/);
 assert.match(main,/pulpUi\.title\(card\.eyebrow,card\.title,card\.subtitle\)/);
 assert.doesNotMatch(ui,/GLTFLoader|\.glb/);
});
test('ajustes se almacenan por separado del progreso y reducen animaciones',()=>{
 assert.match(ui,/writePreference\(this\.actions\.storage,PULP_PREF_KEY/);
 assert.match(ui,/pulp-reduce-motion/);
 assert.match(css,/pulp-reduce-motion .pulp-transition/);
 assert.match(ui,/pulp-high-contrast/);
 assert.match(ui,/pulp-large-text/);
 assert.match(ui,/pulp-grain/);
});
test('opción de volumen controla música/ambiente y también beeps',()=>{
 const audio=read('src/audioDirector.ts');
 assert.match(audio,/setVolume\(value:number\)/);
 assert.match(audio,/uiCue\(kind:/);
 assert.match(audio,/master\.gain\.value=\.42\*this\.volume/);
 assert.match(audio,/osc\.connect\(gain\)\.connect\(this\.master\?\?a\.destination\)/);
});
test('no introduce fuentes web, PNG externos ni postprocesado costoso',()=>{
 assert.doesNotMatch(css,/@import|@font-face|backdrop-filter:blur|filter:blur/);
 assert.doesNotMatch(ui,/fetch\(|WebGLRenderTarget|EffectComposer/);
});
