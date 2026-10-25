import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const txt=p=>readFileSync(new URL(p,root),'utf8');
function glb(n){const b=readFileSync(new URL(`public/models/${n}.glb`,root));assert.equal(b.toString('ascii',0,4),'glTF');assert.equal(b.readUInt32LE(8),b.length);return JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString('utf8'))}
function nodes(doc){return new Set(doc.nodes.map(x=>x.name))}
test('F19: nueva carrocería mallada con UV y decal original, no carrocería F18 duplicada',()=>{
 const d=glb('firebird_77'),n=nodes(d);
 assert.ok(n.has('F19_CurvedBody_53x17_UV'));
 assert.ok(n.has('F19_Original_Desert_Bird_UV'));
 assert.ok(!n.has('F18_SculptedBody_UV'));
 assert.ok(d.meshes.some(m=>m.primitives.some(p=>p.attributes.TEXCOORD_0!==undefined)));
 assert.ok(d.materials.some(m=>m.alphaMode==='BLEND'));
});
test('F19: ruedas animables, referencias de cockpit y nuevos cristales',()=>{
 const d=glb('firebird_77'),n=nodes(d);
 for(const k of ['Wheel_FL','Wheel_FR','Wheel_RL','Wheel_RR','Steering_Wheel_3D','F19_GLASS_Windshield','F19_GLASS_RearHatch','F19_ShakerIntake'])assert.ok(n.has(k),k);
});
test('F19: gasolinera con marquesina y dos surtidores detallados',()=>{
 const n=nodes(glb('sunspur_station'));
 for(const k of ['F19_Canopy_Fold_0','F19_Canopy_Fold_12','F19_PumpCrown_12','F19_PumpCrown_18','F19_Sunspur_Fascia'])assert.ok(n.has(k),k);
});
test('F19: motel con porche y ventanas con textura propia',()=>{
 const n=nodes(glb('mile404_motel'));
 for(const k of ['F19_Motel_PitchedAwning_0','F19_Motel_PitchedAwning_1','F19_Motel_InteriorWindow_0','F19_Mile404_GlowSign'])assert.ok(n.has(k),k);
});
test('F19: recursos offline, versiones y guardado migrable',()=>{
 for(const name of ['firebird_77','sunspur_station','mile404_motel']){
  const d=glb(name);assert.ok(d.images.every(x=>!x.uri||!/^https?:\/\//.test(x.uri)),name);
 }
 assert.equal(JSON.parse(txt('package.json')).version,'0.20.0');
 const main=txt('src/main.ts');assert.match(main,/const SAVE_KEY='dead-road-404-f19-v2'/);
 assert.match(main,/readLatestValidSave\(store,\[SAVE_KEY[^\]]*PHASE18_SAVE_KEY/);
 assert.doesNotMatch(main,/localStorage\.setItem\(PHASE18_SAVE_KEY/);
});
test('F19: generador reproducible, renders, validación y lanzadores Windows/Linux',()=>{
 for(const p of ['tools/phase19_studio_pass.py','tools/validate_art.py','tools/render_phase19_comparison.py','INICIAR-WINDOWS.bat','INICIAR-LINUX-MINT.sh'])assert.ok(existsSync(new URL(p,root)),p);
 assert.match(txt('INICIAR-WINDOWS.bat'),/FASE 19/);
 assert.match(txt('INICIAR-LINUX-MINT.sh'),/FASE 19/);
});
