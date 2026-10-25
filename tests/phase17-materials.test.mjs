import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)).replace(/[/\\]tests$/,'');
const get=(p)=>fs.readFileSync(path.join(root,p),'utf8');
function glb(filename){const b=fs.readFileSync(path.join(root,'public/models',filename));assert.equal(b.toString('ascii',0,4),'glTF');assert.equal(b.readUInt32LE(8),b.length);return JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString('utf8'));}
test('F17: SUNSPUR y MILE 404 llevan mapas de color, normales y rugosidad PBR incrustados',()=>{
 for(const file of ['sunspur_station.glb','mile404_motel.glb']){
  const gltf=glb(file);
  assert.ok((gltf.images||[]).length>=10,`${file} exige arte embebido`);
  assert.ok(gltf.materials.some(m=>m.normalTexture&&m.pbrMetallicRoughness?.metallicRoughnessTexture),`${file} exige PBR completo`);
  assert.ok(gltf.materials.some(m=>m.pbrMetallicRoughness?.baseColorTexture),`${file} exige mapa base`);
  assert.ok(gltf.meshes.length>=16,`${file} debe tener estructura visible`);
 }
});
test('F17: rueda animable y cartel original, ninguna textura depende de CDN',()=>{
 const firebird=glb('firebird_77.glb');const nodes=new Set(firebird.nodes.map(n=>n.name));
 for(const n of ['Wheel_FL','Wheel_FR','Wheel_RL','Wheel_RR','F19_ShakerIntake'])assert.ok(nodes.has(n),n);
 for(const file of ['firebird_77.glb','sunspur_station.glb','mile404_motel.glb']){
  const asset=glb(file);assert.ok(asset.images.every(image=>!image.uri||!/^https?:/.test(image.uri)));
 }
});
test('F17: luz ambiental económica con perfil rendimiento y sin destellos rápidos',()=>{
 const light=get('src/lighting17.ts');const scene=get('src/scene.ts');
 assert.match(light,/this\.stationInterior\.visible=!this\.reduced/);
 assert.match(light,/reducedMotion/);
 assert.match(scene,/this\.lighting17\.setGraphics\(preset\)/);
 assert.match(scene,/this\.lighting17\.animate\(/);
});
test('F17: exportación Blender guarda en carpeta aparte, sin tocar GLB jugables',()=>{
 const author=get('tools/blender_edit_assets.py');
 assert.match(author,/blender-work/);
 assert.match(author,/save_as_mainfile/);
 assert.match(author,/BLENDER-EXPORTED\.glb/);
 assert.ok(!author.includes("filepath=str(root/'public/models'/f'{name}-BLENDER"));
});
test('F17: conserva lectura de guardado F16, sin escribirlo',()=>{
 const main=get('src/main.ts');
 assert.match(main,/const SAVE_KEY='dead-road-404-f19-v2'/);
 assert.match(main,/const PHASE17_SAVE_KEY='dead-road-404-f17-v2'/);
 assert.match(main,/const PHASE16_SAVE_KEY='dead-road-404-f16-v2'/);
 assert.match(main,/readLatestValidSave\(store,\[SAVE_KEY[^\]]*PHASE17_SAVE_KEY/);
 assert.match(main,/readLatestValidSave\(store,\[SAVE_KEY[^\]]*PHASE16_SAVE_KEY/);
 assert.doesNotMatch(main,/setItem\(PHASE17_SAVE_KEY/);
 assert.doesNotMatch(main,/setItem\(PHASE16_SAVE_KEY/);
});
