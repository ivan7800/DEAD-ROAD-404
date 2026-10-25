import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import type {Firebird} from './vehicle.ts';
import {batchStaticModel} from './staticBatch.ts';

/** Author-owned GLB files exported by tools/generate_art_assets.py.
 * Successful loading is required before the procedural fallback is hidden.
 */
export const ART_FILES = {
 firebird:'firebird_77.glb',
 station:'sunspur_station.glb',
 motel:'mile404_motel.glb',
} as const;
export type ArtLoadReport={firebird:boolean;station:boolean;motel:boolean;ok:number;errors:string[];batchedMeshes:number};
function modelURL(file:string):string{
 // Vite BASE_URL handles GitHub Pages, nested hosting and localhost alike.
 return `${(import.meta as ImportMeta & {env:{BASE_URL:string}}).env.BASE_URL}models/${file}`;
}
function configureShadows(root:THREE.Object3D){
 root.traverse(node=>{
  if(!(node instanceof THREE.Mesh))return;
  // The detailed GLBs contain hundreds of small meshes: their per-mesh shadow maps
  // cost multiple passes per light, disproportionate to their visual contribution.
  node.castShadow=false;node.receiveShadow=false;
  const ms=Array.isArray(node.material)?node.material:[node.material];
  for(const m of ms){if(m instanceof THREE.MeshStandardMaterial){
   if(/glass/i.test(m.name)||/glass/i.test(node.name)){m.transparent=true;m.opacity=.72;m.depthWrite=false;node.castShadow=false;}
   // Respect the artist's GLB face-culling intent; do not rasterize both sides of every polygon.
   if(/glass/i.test(m.name)||/glass/i.test(node.name))m.side=THREE.DoubleSide;
   if(/sign|sunspur|poster|billboard|plate|mile404|dustline|fascia|vacancy/i.test(node.name)&&m.map){
    m.emissive.setHex(0xc69a76);m.emissiveMap=m.map;m.emissiveIntensity=.48;
   }
  }}
 });
}
export async function loadArtAssets(
 scene:THREE.Scene,
 firebird:Firebird,
 fallback:{station:THREE.Group;motel:THREE.Group}
):Promise<ArtLoadReport>{
 const loader=new GLTFLoader();
 const result:ArtLoadReport={firebird:false,station:false,motel:false,ok:0,errors:[],batchedMeshes:0};
 const requests = (Object.entries(ART_FILES) as Array<[keyof typeof ART_FILES,string]>).map(async ([id,file])=>{
  try{
   const gltf=await loader.loadAsync(modelURL(file));
   if(!gltf.scene.children.length)throw new Error('GLB vacío');
   configureShadows(gltf.scene);
   if(id==='firebird')firebird.installDetailedModel(gltf.scene);
   else{const batch=batchStaticModel(gltf.scene);result.batchedMeshes+=batch.merged;scene.add(gltf.scene);fallback[id].visible=false;}
   result[id]=true;
   result.ok++;
  }catch(error){
   const message=`${id}: ${error instanceof Error?error.message:String(error)}`;
   result.errors.push(message);console.warn('[DEAD ROAD 404] GLB no disponible, se conserva geometría de reserva:',message);
  }
 });
 await Promise.all(requests);
 return result;
}
