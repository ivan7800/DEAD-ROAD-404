import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('F33: recorrido visual mantiene los seis capítulos y dos tamaños de pantalla',()=>{
 const script=get('scripts/qa-visual33.mjs');
 execFileSync(process.execPath,['--check',new URL('../scripts/qa-visual33.mjs',import.meta.url).pathname],{stdio:'pipe'});
 for(const id of ['last-stop','missing','nameless','dead-frequency','impossible-mile','road-end'])
  assert.match(script,new RegExp("id:'"+id+"'"));
 assert.match(script,/width:1280,height:800/);
 assert.match(script,/width:390,height:844/);
 assert.match(script,/report\.cases\.length,12/);
 assert.match(script,/page\.screenshot/);
 assert.match(script,/#status/);
});
test('F33: registra preferencias de acceso y limita los diagnósticos al navegador aislado',()=>{
 const script=get('scripts/qa-visual33.mjs');
 assert.match(script,/pulp-high-contrast/);
 assert.match(script,/pulp-large-text/);
 assert.match(script,/pulp-reduce-motion/);
 assert.match(script,/pageerror/);
 assert.match(script,/f33-visual-report\.json/);
 assert.doesNotMatch(script,/https:\/\/[^\s]+\/.+fetch/);
});
test('F33: pipeline archiva capturas y usa prueba de resistencia superior a F32',()=>{
 const yaml=get('.github/workflows/deploy.yml');
 const pkg=JSON.parse(get('package.json'));
 assert.equal(pkg.scripts['qa:visual'],'node scripts/qa-visual33.mjs');
 assert.match(yaml,/run: npm run qa:visual/);
 const match=yaml.match(/npm run qa:stability -- --seconds=(\d+)/);
 assert.ok(match&&Number(match[1])>=60);
 assert.match(yaml,/f33-visual-report\.json/);
});
