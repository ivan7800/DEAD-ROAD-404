import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=(p)=>readFileSync(new URL(`../${p}`,import.meta.url),'utf8');
test('las cuatro marcas ficticias son explícitas y no se importan recursos remotos',()=>{
 const art=read('src/americana1992.ts');
 for(const name of ['SUNSPUR','DUSTLINE','NOCTURNE','MILE 404'])assert.match(art,new RegExp(name));
 assert.doesNotMatch(art,/https?:\/\//i);
});
test('versión y ambientación de 1992 concordantes',()=>{
 assert.equal(JSON.parse(read('package.json')).version,'0.21.1');
 assert.match(read('index.html'),/1992/);
 assert.match(read('index.html'),/v0\.21\.1/);
});
test('Fase 17 no pisa guardados de versiones anteriores',()=>{
 const main=read('src/main.ts');
 assert.match(main,/const SAVE_KEY='dead-road-404-f19-v2'/);
 assert.match(main,/const PHASE18_SAVE_KEY='dead-road-404-f18-v2'/);
 assert.match(main,/const PHASE17_SAVE_KEY='dead-road-404-f17-v2'/);
 assert.match(main,/const PHASE16_SAVE_KEY='dead-road-404-f16-v2'/);
 assert.match(main,/const LEGACY_SAVE_KEY='dead-road-404-f15-v2'/);
 assert.match(main,/const PRIOR_SAVE_KEY='dead-road-404-f14-v2'/);
 assert.match(main,/const OLDER_SAVE_KEY='dead-road-404-f13-v2'/);
 assert.match(main,/const ORIGINAL_SAVE_KEY='dead-road-404-v2'/);
 assert.match(main,/readLatestValidSave\(store,\[SAVE_KEY[^\]]*PHASE18_SAVE_KEY/);
 assert.match(main,/readLatestValidSave\(store,\[SAVE_KEY[^\]]*PHASE17_SAVE_KEY/);
 assert.match(main,/readLatestValidSave\(store,\[SAVE_KEY[^\]]*PHASE16_SAVE_KEY/);
 assert.match(main,/readLatestValidSave\(store,\[SAVE_KEY[^\]]*LEGACY_SAVE_KEY/);
 assert.doesNotMatch(main,/localStorage\.setItem\(LEGACY_SAVE_KEY/);
 assert.doesNotMatch(main,/localStorage\.setItem\(PHASE18_SAVE_KEY/);
});
test('decoración se inyecta en escena sin eliminar mundo previo',()=>{
 const scene=read('src/scene.ts');
 assert.match(scene,/new Americana1992\(\)/);
 assert.match(scene,/this\.scene\.add\(this\.roadsideArt\.group\)/);
 assert.match(scene,/this\.scene\.add\(this\.americana1992\.group\)/);
});
