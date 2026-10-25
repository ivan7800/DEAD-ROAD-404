import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {RenderPacer} from '../src/renderPacer.ts';
import {batchStaticModel} from '../src/staticBatch.ts';

test('renderizar todos los fotogramas cuando se juega en primer plano',()=>{
 const p=new RenderPacer(12);
 for(let now=0;now<=100;now+=10)assert.equal(p.shouldRender(now,true,true),true);
});
test('menus y pausa limitan la frecuencia; pestaña oculta no renderiza',()=>{
 const p=new RenderPacer(10);
 assert.equal(p.shouldRender(0,true,false),true);
 assert.equal(p.shouldRender(16,true,false),false);
 assert.equal(p.shouldRender(99,true,false),false);
 assert.equal(p.shouldRender(100,true,false),true);
 assert.equal(p.shouldRender(105,false,true),false);
 assert.equal(p.shouldRender(110,true,false),true);
 assert.equal(p.shouldRender(Number.NaN,true,true),false);
 p.reset();assert.equal(p.shouldRender(120,true,false),true);
});
test('segundo lote PSX agrupa Lambert iguales sin alterar posiciones ni colores',()=>{
 const scene=new THREE.Group(),materials=[];
 for(let n=0;n<4;n++){
  const mat=new THREE.MeshLambertMaterial({color:0x775566,flatShading:true});
  materials.push(mat);
  const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),mat);
  m.position.x=n*2;scene.add(m);
 }
 const before=scene.children.slice();
 const batch=batchStaticModel(scene,{directOnly:true,cellSize:20});
 assert.equal(batch.merged,3);
 assert.equal(batch.before,4);assert.equal(batch.after,1);
 assert.equal(scene.children.length,1);
 const mesh=scene.children[0];assert.ok(mesh instanceof THREE.Mesh);
 assert.equal(mesh.material,materials[0]);
 mesh.geometry.computeBoundingBox();
 assert.ok(mesh.geometry.boundingBox.min.x<-.49);
 assert.ok(mesh.geometry.boundingBox.max.x>6.49);
 assert.equal(before[0].geometry.attributes.position.count,24,'no se modifica geometría de origen');
});
test('conserva decorados no equivalentes, transparentes e interactivos',()=>{
 const root=new THREE.Group(),interactive=new THREE.Group();root.add(interactive);
 const one=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xff0000}));
 const other=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0x0000ff}));
 const glass=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xff0000,transparent:true,opacity:.5}));
 const actor=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0xff0000}));
 interactive.add(actor);root.add(one,other,glass);
 const r=batchStaticModel(root,{directOnly:true});
 assert.equal(r.merged,0);
 assert.deepEqual(root.children,[interactive,one,other,glass]);
 assert.equal(interactive.children[0],actor);
});
test('lotes por celda no unen elementos separados por una distancia grande',()=>{
 const root=new THREE.Group();
 for(const x of [1,30]){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial({color:0x775566}));
  mesh.position.x=x;root.add(mesh);
 }
 assert.equal(batchStaticModel(root,{directOnly:true,cellSize:20}).merged,0);
});
