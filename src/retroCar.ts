import * as THREE from 'three';
/** Original 1977-inspired PSX roadster, no external textures or PBR materials. */
export interface RetroCar {group:THREE.Group;wheels:THREE.Group[];headlights:THREE.Mesh[]}
const matte=(hex:number)=>new THREE.MeshLambertMaterial({color:hex,flatShading:true});
const light=(hex:number)=>new THREE.MeshBasicMaterial({color:hex});
export function makeRetroCar():RetroCar{
 const group=new THREE.Group();group.name='PSX_Firebird_404';
 const paint=matte(0x171719),gold=matte(0xb38a51),rubber=matte(0x101114),
       glass=matte(0x34434b),chrome=matte(0x746e69),taillamp=light(0x932a2b),beam=light(0xe9c58a);
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,material:THREE.Material)=>{
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  m.position.set(x,y,z);group.add(m);return m;
 };
 box(2.5,.55,4.9,0,.75,0,paint);
 box(2.33,.13,2.45,0,1.06,-1.13,paint);
 box(2.2,.18,1.15,0,1.08,1.74,paint);
 const windscreen=box(2.0,.055,.89,0,1.48,-.6,glass);windscreen.rotation.x=-.67;
 const rearGlass=box(1.93,.055,1.25,0,1.48,.93,glass);rearGlass.rotation.x=.60;
 box(2.06,.14,1.16,0,1.82,.18,paint);
 for(const side of [-1,1]){
  const window=box(.045,.46,1.22,side*1.035,1.51,.11,glass);window.rotation.z=side*.06;
  box(.08,.045,3.45,side*1.19,1.02,.05,gold);
  box(.31,.09,.28,side*1.26,1.32,-.78,paint);
  box(.40,.12,.14,side*.77,.65,2.49,taillamp);
  box(.63,.13,.10,side*.75,.88,-2.48,beam);
  for(const offset of [-.2,.2])box(.035,.025,1.65,side*(.22+Math.abs(offset)),1.145,-1.22,gold);
 }
 box(2.48,.12,.13,0,.48,-2.48,chrome);
 box(2.48,.12,.13,0,.48,2.5,chrome);
 box(.56,.19,.75,0,1.17,-1.17,paint);
 const wheels:THREE.Group[]=[];
 for(const x of [-1.25,1.25])for(const z of [-1.5,1.62]){
  const pivot=new THREE.Group();pivot.position.set(x,.48,z);
  const tire=new THREE.Mesh(new THREE.CylinderGeometry(.48,.48,.22,8),rubber);tire.rotation.z=Math.PI/2;pivot.add(tire);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.235,8),gold);hub.rotation.z=Math.PI/2;pivot.add(hub);
  group.add(pivot);wheels.push(pivot);
 }
 const headlights:THREE.Mesh[]=[];
 group.traverse(o=>{if(o instanceof THREE.Mesh&&o.material===beam)headlights.push(o);});
 return {group,wheels,headlights};
}
