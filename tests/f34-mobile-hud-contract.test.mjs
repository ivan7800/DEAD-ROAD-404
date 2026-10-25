import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('F34: CSS reserves separate mobile HUD lanes, removes redundant overlays',()=>{
 const css=read('src/ui/pulp.css');
 assert.match(css,/F34 · Capturas reales F33/);
 for(const selector of ['#stats','#objective','.stamina-wrap','.prompt','.toast',
  '.graphics-label','.art-status','header .brand','#pulp-pause-access']){
   assert.ok(css.includes(selector),'No mobile fix for '+selector);
 }
 assert.match(css,/html\.psx-mode\[data-pulp-mode="explore"\] \.toast/);
 assert.match(css,/html\.psx-mode\[data-pulp-mode="explore"\] \.hud/);
 assert.match(css,/max-height:520px/);
});
test('F34: visual regression checks viewport rectangles instead of merely saving screenshots',()=>{
 const qa=read('scripts/qa-visual33.mjs');
 execFileSync(process.execPath,['--check',new URL('../scripts/qa-visual33.mjs',import.meta.url).pathname]);
 assert.match(qa,/width:320,height:568/);
 assert.match(qa,/width:390,height:844/);
 assert.match(qa,/report\.cases\.length,18/);
 for(const text of ['pausa/estadísticas','estadísticas/objetivo','narrativa/resistencia',
  'instrucción/resistencia','narrativa/objetivo'])
  assert.ok(qa.includes(text),'Expected overlap assertion '+text);
});
