import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
/** Offline-style batching on load: merge opaque static GLB meshes sharing material/attributes.
 * Excludes animated, skinned, morph, transparent and multi-material meshes.
 * Failures preserve the original rendering without dropping content.
 */
export function batchStaticModel(root:THREE.Object3D,options:{directOnly?:boolean;cellSize?:number}={}):{before:number;after:number;merged:number}{
 root.updateMatrixWorld(true);
 const beforeMeshes:THREE.Mesh[]=[];
 if(options.directOnly)for(const obj of root.children){if(obj instanceof THREE.Mesh)beforeMeshes.push(obj);}
 else root.traverse(obj=>{if(obj instanceof THREE.Mesh)beforeMeshes.push(obj);});
 const invRoot=root.matrixWorld.clone().invert();
 const groups=new Map<string,THREE.Mesh[]>();
 for(const mesh of beforeMeshes){
  if(mesh instanceof THREE.SkinnedMesh||mesh instanceof THREE.InstancedMesh||Array.isArray(mesh.material)||mesh.material.transparent||
     !mesh.visible||!mesh.parent||Object.values(mesh.geometry.morphAttributes).some(attributes=>attributes.length>0))continue;
  const geometry=mesh.geometry;
  if(!geometry.attributes.position||geometry.groups.length>1)continue;
  const attributes=Object.keys(geometry.attributes).sort().map(k=>{
   const a=geometry.getAttribute(k);return k+':'+a.itemSize+':'+a.array.constructor.name+':'+a.normalized;
  }).join('|');
  const material=mesh.material;
  // Canonicalize ONLY plain, untextured factory materials; repeated posts share draw calls.
  const plain=material instanceof THREE.MeshStandardMaterial && !material.map&&!material.normalMap&&!material.alphaMap&&!material.aoMap&&!material.emissiveMap&&!material.roughnessMap&&!material.metalnessMap&&!material.envMap;
  const sameLook=plain?
    [material.type,material.color.getHexString(),material.roughness,material.metalness,
     material.emissive.getHexString(),material.emissiveIntensity,material.side,
     material.flatShading,material.vertexColors,material.opacity,material.depthWrite].join(':'):
    material.uuid;
  const center=mesh.getWorldPosition(new THREE.Vector3());
  const cell=options.cellSize&&options.cellSize>0?Math.floor(center.x/options.cellSize)+','+Math.floor(center.z/options.cellSize):'all';
  const key=sameLook+'|'+attributes+'|'+Boolean(geometry.index)+'|'+cell;
  const bucket=groups.get(key)||[];bucket.push(mesh);groups.set(key,bucket);
 }
 let merged=0;
 for(const meshes of groups.values()){
  if(meshes.length<2)continue;
  const copies:THREE.BufferGeometry[]=[];
  try{
   for(const mesh of meshes)copies.push(mesh.geometry.clone().applyMatrix4(invRoot.clone().multiply(mesh.matrixWorld)));
   const combined=mergeGeometries(copies,false);
   if(!combined)continue;
   combined.computeBoundingSphere();
   const batch=new THREE.Mesh(combined,meshes[0].material);
   batch.name='STATIC_BATCH_'+merged;batch.castShadow=false;batch.receiveShadow=false;
   root.add(batch);
   for(const mesh of meshes)mesh.parent?.remove(mesh);
   merged+=meshes.length-1;
  }catch(error){console.warn('[DEAD ROAD 404] Lote estático omitido:',error);}
  finally{for(const copy of copies)copy.dispose();}
 }
 return {before:beforeMeshes.length,after:beforeMeshes.length-merged,merged};
}
