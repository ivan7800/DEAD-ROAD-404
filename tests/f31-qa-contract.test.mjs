import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const text=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('script F31 analiza los cuatro finales mediante UI, no solo lógica pura',()=>{
 const script=text('scripts/qa-finales31.mjs');
 execFileSync(process.execPath,['--check',new URL('../scripts/qa-finales31.mjs',import.meta.url).pathname]);
 for(const id of ['dawn','toll','loop','chorus'])assert.match(script,new RegExp("id:'"+id+"'"));
 assert.match(script,/getByRole\('button',\{name:new RegExp\(ending.choice\)\}\)/);
 assert.match(script,/page\.reload/);assert.match(script,/localStorage\.getItem/);
 assert.match(script,/f31-final-/);
});
test('auditoría visual en 1280px y móvil de 390px conserva capturas',()=>{
 const script=text('scripts/qa-finales31.mjs');
 assert.match(script,/width:1280,height:800/);
 assert.match(script,/width:390,height:844/);
 assert.match(script,/documentWidth<=metrics\.vw\+3/);
 assert.match(script,/page\.screenshot/);
});
test('instalaciones deben estar fijadas en lockfile npm válido',()=>{
 assert.equal(existsSync(new URL('../package-lock.json',import.meta.url)),true,
  'Falta package-lock.json generado por npm');
 const pkg=JSON.parse(text('package.json')),lock=JSON.parse(text('package-lock.json'));
 assert.equal(lock.lockfileVersion,3);
 assert.equal(lock.name,pkg.name);assert.equal(lock.version,pkg.version);
 assert.deepEqual(lock.packages[''].dependencies,pkg.dependencies);
 assert.deepEqual(lock.packages[''].devDependencies,pkg.devDependencies);
 const ci=text('.github/workflows/deploy.yml');
 assert.match(ci,/run: npm ci/);
 assert.doesNotMatch(ci,/run: npm install\s*\n/);
});
