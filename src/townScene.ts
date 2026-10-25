import * as THREE from 'three';
import {TOWN_LOCATIONS,type TownStage} from './chapterThree.ts';

/** EL PUEBLO SIN NOMBRE — original late-PS1 geometry, independent of external files.
 * All signage is drawn to nearest-filtered tiny textures. No dynamic lighting/shadows.
 */
export class TownScene{
 readonly group=new THREE.Group();
 readonly scenery=new THREE.Group();
 readonly memorial=new THREE.Group();
 readonly generator=new THREE.Group();
 readonly archive=new THREE.Group();
 readonly keypad=new THREE.Group();
 readonly chapel=new THREE.Group();
 readonly witness=new THREE.Group();
 readonly supplies=new THREE.Group();
 readonly guardian=new THREE.Group();
 private guardianEye:THREE.Mesh;
 private clock:THREE.Mesh;
 private readonly mat={
  road:new THREE.MeshLambertMaterial({color:0x22252e,flatShading:true}),
  asphalt:new THREE.MeshLambertMaterial({color:0x322d36,flatShading:true}),
  brick:new THREE.MeshLambertMaterial({color:0x49404a,flatShading:true}),
  brickAlt:new THREE.MeshLambertMaterial({color:0x594a50,flatShading:true}),
  stone:new THREE.MeshLambertMaterial({color:0x6d6569,flatShading:true}),
  dark:new THREE.MeshLambertMaterial({color:0x231e2b,flatShading:true}),
  wood:new THREE.MeshLambertMaterial({color:0x634a42,flatShading:true}),
  metal:new THREE.MeshLambertMaterial({color:0x797077,flatShading:true}),
  copper:new THREE.MeshLambertMaterial({color:0xa4715a,flatShading:true}),
  glow:new THREE.MeshBasicMaterial({color:0xe3aa77}),
  red:new THREE.MeshBasicMaterial({color:0xd34b57}),
  spectral:new THREE.MeshBasicMaterial({color:0xb3bc9a})
 };
 private box(parent:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,material:THREE.Material){
  const object=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  object.position.set(x,y,z);object.castShadow=false;object.receiveShadow=false;
  parent.add(object);return object;
 }
 private sign(word:string,w:number,h:number,x:number,y:number,z:number){
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=32;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.fillStyle='#1e1b24';ctx.fillRect(0,0,128,32);
  ctx.strokeStyle='#be865d';ctx.lineWidth=2;ctx.strokeRect(2,2,124,28);
  ctx.fillStyle='#f8d2a4';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(word,64,16,120);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;
  const object=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
  object.position.set(x,y,z);this.scenery.add(object);
 }
 private building(x:number,z:number,w:number,d:number,h:number,material:THREE.Material,name:string){
  const m=this.mat;
  this.box(this.scenery,w,h,d,x,h/2,z,material);
  this.box(this.scenery,w+.65,.34,d+.6,x,h+.17,z,m.dark);
  this.box(this.scenery,2.05,2.7,.12,x,1.42,z+d/2+.08,m.wood);
  this.box(this.scenery,1.35,1.14,.13,x-w*.25,2.4,z+d/2+.09,m.dark);
  this.box(this.scenery,1.0,.9,.14,x+w*.25,2.4,z+d/2+.09,m.glow);
  this.sign(name,Math.min(w*.8,4),.55,x,h-.9,z+d/2+.19);
  for(let i=0;i<3;i++)this.box(this.scenery,.13,h,.15,x-w/2+(i+1)*w/4,h/2,z+d/2+.2,m.stone);
 }
 constructor(){
  this.group.name='EL_PUEBLO_SIN_NOMBRE_PSX';
  this.scenery.name='TOWN_STATIC';
  this.group.add(this.scenery,this.memorial,this.generator,this.archive,this.keypad,
   this.chapel,this.witness,this.supplies,this.guardian);
  this.group.visible=false;
  const m=this.mat,b=this.box.bind(this);
  // Local road and pavement: correct even when the existing station is invisible.
  b(this.scenery,42,.13,41,15,-.07,-45,m.asphalt);
  b(this.scenery,13,.035,38,13,.01,-44,m.road);
  for(let z=-34;z>=-57;z-=5.5)b(this.scenery,.18,.014,2.5,13,.042,z,m.stone);
  for(const x of [4.6,25.4])b(this.scenery,.45,.3,38,x,.15,-45,m.stone);
  // Vacant storefronts and their black windows.
  this.building(-.3,-40,7.0,11.6,5.9,m.brick,'CINE 404');
  this.building(-.3,-55.5,7.0,8.2,6.4,m.brickAlt,'HOTEL VACIO');
  this.building(32,-34,7,8.5,6.1,m.brickAlt,'FARMACIA');
  this.building(32,-47,7,12.1,6.8,m.brick,'ARCHIVO');
  // Radio antenna over the archive, no actual expensive point light.
  b(this.scenery,.18,7.8,.18,32,10.5,-47,m.metal);
  for(const y of [9.0,11,13])b(this.scenery,2.6,.12,.12,32,y,-47,m.copper);
  b(this.scenery,.9,.35,.6,32,14.5,-47,m.red);
  // Chapel and bell tower at the far end.
  b(this.scenery,6.3,5.9,9,21.2,2.95,-58,m.stone);
  b(this.scenery,6.9,.45,9.8,21.2,6.1,-58,m.dark);
  b(this.scenery,2.1,3.0,.3,18.02,1.5,-55.8,m.wood);
  b(this.scenery,3.15,9.5,3.15,23.7,4.9,-60,m.stone);
  b(this.scenery,3.4,.4,3.5,23.7,9.8,-60,m.dark);
  this.clock=b(this.scenery,1.42,1.42,.14,23.7,8.15,-58.28,m.glow);
  b(this.scenery,.13,.59,.18,23.7,8.24,-58.18,m.dark);
  b(this.scenery,.48,.12,.18,23.94,8.03,-58.16,m.dark);
  this.sign('03:13',2.0,.6,23.7,7.22,-58.15);
  // Telephone poles, street lamps, debris. No dynamic shadows.
  for(const z of [-31,-42,-53]){
   for(const x of [5.5,26]){
    b(this.scenery,.2,5.0,.2,x,2.5,z,m.metal);
    b(this.scenery,1.15,.15,.2,x+.45,4.9,z,m.metal);
    b(this.scenery,.33,.17,.33,x+.9,4.8,z,m.glow);
   }
  }
  for(const [x,z] of [[7,-41],[23,-34],[19,-51],[-3,-33],[27,-57]]){
   b(this.scenery,1.0,.2,.6,x,.16,z,m.wood);
   b(this.scenery,.45,.3,.4,x+.7,.14,z+.7,m.stone);
  }
  // A tiny standing road sign at the entry.
  b(this.scenery,.13,3.5,.13,19,1.75,-30,m.metal);
  b(this.scenery,3.35,1.06,.12,19,3.15,-30,m.dark);
  this.sign('SIN NOMBRE',3.1,.82,19,3.15,-29.87);
  // Quest props: independently switchable visibility, never merged into scenery.
  this.memorial.position.set(TOWN_LOCATIONS.memorial.x,0,TOWN_LOCATIONS.memorial.z);
  b(this.memorial,1.7,2.1,.45,0,1.07,0,m.stone);
  b(this.memorial,1.3,.78,.06,0,1.64,.27,m.dark);
  b(this.memorial,1.17,.13,.07,0,1.62,.35,m.glow);
  this.generator.position.set(TOWN_LOCATIONS.generator.x,0,TOWN_LOCATIONS.generator.z);
  b(this.generator,1.6,1.18,.9,0,.68,0,m.metal);
  b(this.generator,1.45,.25,.8,0,1.37,0,m.copper);
  b(this.generator,.25,.5,.14,.45,1.64,.2,m.red);
  this.archive.position.set(TOWN_LOCATIONS.archive.x,0,TOWN_LOCATIONS.archive.z);
  b(this.archive,1.5,1.06,.6,0,1.05,0,m.wood);
  b(this.archive,1.34,.1,.52,0,1.63,.04,m.glow);
  b(this.archive,.24,.22,.12,-.35,1.72,.33,m.dark);
  this.keypad.position.set(TOWN_LOCATIONS.frequency.x,0,TOWN_LOCATIONS.frequency.z);
  b(this.keypad,1.1,1.4,.3,0,1.32,0,m.metal);
  b(this.keypad,.83,.43,.12,0,1.6,.21,m.glow);
  for(const x of [-.23,.23])for(const y of [1.09,1.34])
   b(this.keypad,.17,.13,.09,x,y,.21,m.red);
  this.chapel.position.set(TOWN_LOCATIONS.chapel.x,0,TOWN_LOCATIONS.chapel.z);
  b(this.chapel,1.7,3.0,.7,0,1.5,0,m.wood);
  b(this.chapel,1.53,1.1,.11,0,2.5,.39,m.dark);
  b(this.chapel,.2,.22,.14,.55,1.25,.41,m.glow);
  this.witness.position.set(TOWN_LOCATIONS.witness.x,0,TOWN_LOCATIONS.witness.z);
  b(this.witness,.63,1.16,.5,0,1.03,0,m.brickAlt);
  b(this.witness,.51,.52,.4,0,1.93,0,m.stone);
  b(this.witness,.92,.2,.59,0,2.15,0,m.dark);
  for(const x of [-.25,.25])b(this.witness,.18,.72,.23,x,.37,0,m.dark);
  this.supplies.position.set(TOWN_LOCATIONS.supplies.x,0,TOWN_LOCATIONS.supplies.z);
  b(this.supplies,1.08,.65,.76,0,.38,0,m.wood);
  b(this.supplies,1.14,.13,.81,0,.72,0,m.copper);
  b(this.supplies,.52,.1,.05,0,.76,.4,m.glow);
  // Main enemy: eight-sided inverted bell head, long legs and bright telegraph eye.
  b(this.guardian,.91,1.45,.66,0,1.28,0,m.brick);
  b(this.guardian,.52,1.0,.47,0,2.44,0,m.stone);
  const bell=new THREE.Mesh(new THREE.CylinderGeometry(.55,.86,.96,8),m.copper);
  bell.position.set(0,3.12,0);this.guardian.add(bell);
  b(this.guardian,.96,.13,.84,0,3.59,0,m.dark);
  this.guardianEye=b(this.guardian,.33,.19,.11,0,3.05,-.61,m.red);
  for(const x of [-.67,.67]){
   b(this.guardian,.2,1.37,.23,x,1.55,0,m.stone);
   b(this.guardian,.22,.85,.25,x*.43,.44,0,m.dark);
  }
  this.guardian.visible=false;this.setStage('locked',false,false);
 }
 setStage(stage:TownStage,witnessMet:boolean,cacheTaken:boolean){
  this.memorial.visible=stage==='arrival';
  this.generator.visible=stage==='generator';
  this.archive.visible=stage==='archive';
  this.keypad.visible=stage==='frequency';
  this.chapel.visible=stage==='chapel'||stage==='guardian'||stage==='choice';
  this.witness.visible=stage!=='locked'&&stage!=='complete'&&!witnessMet;
  this.supplies.visible=stage!=='locked'&&!cacheTaken;
  this.guardian.visible=stage==='guardian';
 }
 setGuardian(x:number,z:number,visible:boolean,telegraph:boolean,elapsed:number){
  this.guardian.visible=visible;
  if(!visible)return;
  this.guardian.position.set(x,Math.sin(elapsed*3.4)*.05,z);
  (this.guardianEye.material as THREE.MeshBasicMaterial).color.setHex(telegraph?0xfff1a6:0xd34b57);
  this.guardianEye.scale.x=telegraph?1.8:1;
 }
}
