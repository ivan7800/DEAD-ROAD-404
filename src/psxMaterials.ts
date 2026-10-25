import * as THREE from 'three';
/** Retrospective nearest filtering, quantized palette and inexpensive Lambert shading. */
export function applyPSXMaterials(root:THREE.Object3D):number{
 const cache=new Map<THREE.Material,THREE.Material>();let count=0;
 const nearest=(tex:THREE.Texture|null)=>{if(!tex)return;tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;tex.anisotropy=1;tex.needsUpdate=true;};
 const quantize=(c:THREE.Color)=>{const t=c.clone();t.r=Math.round(t.r*6)/6;t.g=Math.round(t.g*6)/6;t.b=Math.round(t.b*6)/6;return t;};
 root.traverse(obj=>{
  if(!(obj instanceof THREE.Mesh))return;
  const materials=Array.isArray(obj.material)?obj.material:[obj.material];
  const updated=materials.map(source=>{
   const hit=cache.get(source);if(hit)return hit;
   let mat:THREE.Material=source;
   if(source instanceof THREE.MeshStandardMaterial){
    nearest(source.map);nearest(source.emissiveMap);
    mat=new THREE.MeshLambertMaterial({
     color:quantize(source.color),map:source.map,side:source.side,
     transparent:source.transparent,opacity:source.opacity,
     alphaTest:source.alphaTest,depthWrite:source.depthWrite,
     emissive:quantize(source.emissive),emissiveMap:source.emissiveMap
    });count++;
   }else if(source instanceof THREE.MeshBasicMaterial)nearest(source.map);
   cache.set(source,mat);return mat;
  });
  obj.material=Array.isArray(obj.material)?updated:updated[0];
  obj.castShadow=false;obj.receiveShadow=false;
 });
 return count;
}
