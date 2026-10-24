import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=(f)=>fs.readFileSync(new URL(`../${f}`,import.meta.url),'utf8');
test('controlador de entradas, física y colisiones conectados',()=>{
 const main=source('src/main.ts');
 for(const t of ['new InputController()','stepArcadeDrive(','walkWithSlide(','toggleHelp()'])assert.ok(main.includes(t),t);
 assert.ok(!main.includes('const sideWall='),'No duplicar colisiones en main');
});
test('edificios enriquecidos separados del controlador',()=>{
 const scene=source('src/scene.ts');const art=source('src/architecturalPass.ts');
 assert.ok(scene.includes('this.scene.add(this.architecturalPass.group)'));
 for(const t of ['SUNSPUR','MILE 404','buildStation()','buildMotel()'])assert.ok(art.includes(t),t);
});
test('guía de controles accesible en el DOM',()=>{
 const html=source('index.html');
 for(const id of ['show-controls','close-controls','controls-guide'])assert.ok(html.includes(`id="${id}"`));
 assert.ok(html.includes('aria-modal="true"'));
});
