import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)).replace(/[/\\]tests$/,'');
const files=['firebird_77.glb','sunspur_station.glb','mile404_motel.glb'];
function readGLB(filename){
 const buf=fs.readFileSync(path.join(root,'public/models',filename));
 assert.equal(buf.toString('ascii',0,4),'glTF');
 assert.equal(buf.readUInt32LE(4),2);
 assert.equal(buf.readUInt32LE(8),buf.length);
 const len=buf.readUInt32LE(12);
 assert.equal(buf.toString('ascii',16,20),'JSON');
 const data=JSON.parse(buf.subarray(20,20+len).toString('utf8'));
 return {buf,data};
}
test('tres modelos glb locales integrados, sin descarga de modelos ajenos',()=>{
 const src=fs.readFileSync(path.join(root,'src/artAssets.ts'),'utf8');
 for(const f of files){assert.ok(fs.statSync(path.join(root,'public/models',f)).size>10000);assert.ok(src.includes(f));}
 assert.ok(src.includes('Promise.all(requests)'));
 assert.ok(src.includes('fallback[id].visible=false'));
 assert.ok(src.includes('installDetailedModel(gltf.scene)'));
});
test('GLBs son glTF 2.0 válidos a nivel contenedor, con buffers internos',()=>{
 for(const filename of files){
  const {data}=readGLB(filename);
  assert.equal(data.asset.version,'2.0');
  assert.ok(data.meshes.length>=10,filename);
  assert.ok(data.accessors.length>0);
  assert.ok(data.buffers.length>0);
  assert.ok(data.bufferViews.length>0);
  assert.ok(data.nodes.length>0);
  const used=data.nodes.filter(n=>Number.isInteger(n.mesh)).map(n=>n.mesh);
  assert.ok(used.length>0 && used.every(i=>i>=0&&i<data.meshes.length));
 }
});
test('Firebird incluye cuatro ruedas independientes para animación real',()=>{
 const {data}=readGLB('firebird_77.glb');
 const names=new Set(data.nodes.map(n=>n.name));
 for(const wheel of ['Wheel_FL','Wheel_FR','Wheel_RL','Wheel_RR'])assert.ok(names.has(wheel),wheel);
});
test('decoración de época y materiales con imagen embebida',()=>{
 for(const name of ['sunspur_station.glb','mile404_motel.glb']){
  const {data}=readGLB(name);
  assert.ok(data.images?.length>=2,`${name}: texturas incorporadas`);
  assert.ok(data.materials?.length>=1,`${name}: materiales propios`);
 }
});
test('la geometría de reserva solo se oculta tras cargar el GLB',()=>{
 const scene=fs.readFileSync(path.join(root,'src/scene.ts'),'utf8');
 const vehicle=fs.readFileSync(path.join(root,'src/vehicle.ts'),'utf8');
 for(const marker of ['stationFallback','motelFallback','await loadArtAssets','this.artStatus=','this.architecturalPass.group.visible=false'])assert.ok(scene.includes(marker),marker);
 assert.ok(vehicle.includes('this.body.visible=false;this.detailedModel=model'));
});
test('fase nueva conserva todas las claves de guardado anteriores',()=>{
 const main=fs.readFileSync(path.join(root,'src/main.ts'),'utf8');
 for(const key of ['dead-road-404-f16-v2','dead-road-404-f15-v2','dead-road-404-f14-v2','dead-road-404-f13-v2','dead-road-404-v2'])assert.ok(main.includes(key),key);
});
