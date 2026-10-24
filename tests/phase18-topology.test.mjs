import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root = new URL('../',import.meta.url);
const get=(p)=>readFileSync(new URL(p,root),'utf8');
function glb(name){
 const buf=readFileSync(new URL(`public/models/${name}.glb`,root));
 assert.equal(buf.toString('ascii',0,4),'glTF');
 assert.equal(buf.readUInt32LE(8),buf.length);
 const doc=JSON.parse(buf.subarray(20,20+buf.readUInt32LE(12)).toString('utf8'));
 return doc;
}
test('F18: el Firebird usa una carrocería mallada y UV auténticas',()=>{
 const d=glb('firebird_77');
 const nodes=new Set(d.nodes.map(n=>n.name));
 assert.ok(nodes.has('F19_CurvedBody_53x17_UV'));
 assert.ok(nodes.has('F19_ShakerIntake'));
 assert.ok(nodes.has('F19_RoofPanel_1'));
 assert.ok(d.meshes.some(m=>m.primitives.some(p=>p.attributes.TEXCOORD_0!==undefined)));
 const mats=d.materials.filter(m=>m.pbrMetallicRoughness?.baseColorTexture);
 assert.ok(mats.length>=2);
});
test('F18: cuatro ruedas independientes, cámara de conductor preservada',()=>{
 const d=glb('firebird_77');const nodes=new Set(d.nodes.map(n=>n.name));
 for(const n of ['Wheel_FL','Wheel_FR','Wheel_RL','Wheel_RR','F19_GLASS_Windshield','Steering_Wheel_3D'])assert.ok(nodes.has(n),n);
 const source=get('src/vehicle.ts');assert.match(source,/getObjectByName\(n\)/);
});
test('F18: SUNSPUR y MILE 404 tienen nuevas fachadas UV y silueta propia',()=>{
 const a=glb('sunspur_station'),b=glb('mile404_motel');
 const sa=new Set(a.nodes.map(n=>n.name)),sb=new Set(b.nodes.map(n=>n.name));
 for(const n of ['F18_Ceramic_Facade_UV_1','F18_Ceramic_Facade_UV_2','F18_Sunspur_Pylon_Neon_UV','F18_Canopy_Weathered_Roof_UV'])assert.ok(sa.has(n),n);
 for(const n of ['F18_Motel_Rose_Brick_UV_1','F18_Motel_Rose_Brick_UV_2','F18_Motel_Roadside_Neon_UV','F18_Motel_Parapet_3.89'])assert.ok(sb.has(n),n);
});
test('F18: rutas y tres GLB integrados sin recursos remotos',()=>{
 const loader=get('src/artAssets.ts');
 for(const name of ['firebird_77.glb','sunspur_station.glb','mile404_motel.glb'])assert.ok(loader.includes(name));
 assert.ok(loader.includes('fallback[id].visible=false'));
 for(const name of ['firebird_77','sunspur_station','mile404_motel']){
  const d=glb(name);assert.ok(d.images?.every(x=>!x.uri||!/^https?:/.test(x.uri)));
 }
});
test('F18: preserva F17 como origen de guardado, sin sobrescribirlo',()=>{
 const s=get('src/main.ts');
 assert.match(s,/const SAVE_KEY='dead-road-404-f19-v2'/);
 assert.match(s,/getItem\(PHASE17_SAVE_KEY\)/);
 assert.doesNotMatch(s,/setItem\(PHASE17_SAVE_KEY/);
});
test('F18: herramientas de autoría reproducibles y lanzadores incluidos',()=>{
 for(const name of ['tools/phase18_rebuild.py','tools/generate_art_assets.py','tools/render_previews.py',
   'tools/blender_edit_assets.py','INICIAR-WINDOWS.bat','INICIAR-LINUX-MINT.sh'])
  assert.ok(existsSync(new URL(name,root)),name);
});
