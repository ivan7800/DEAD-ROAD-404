import * as THREE from 'three';
import {DINER_POSITIONS,type DinerStage} from './chapterTwo.ts';

/** THE LAST LIGHT, 1992. Original PSX low-poly diner.
 * All meshes are procedural, no external GLB, textures or shadow passes.
 * Static scenery is separate from interactive objects for safe batching.
 */
export class DinerScene{
 readonly group=new THREE.Group();
 readonly scenery=new THREE.Group();
 readonly ticket=new THREE.Group();
 readonly breaker=new THREE.Group();
 readonly ledger=new THREE.Group();
 readonly keypad=new THREE.Group();
 readonly freezer=new THREE.Group();
 readonly mara=new THREE.Group();
 readonly threat=new THREE.Group();
 private threatEye:THREE.Mesh;
 private neon:THREE.Mesh;
 private readonly colors={
  wall:new THREE.MeshLambertMaterial({color:0x45404a,flatShading:true}),
  tile:new THREE.MeshLambertMaterial({color:0x36363d,flatShading:true}),
  roof:new THREE.MeshLambertMaterial({color:0x211d2a,flatShading:true}),
  booth:new THREE.MeshLambertMaterial({color:0x804b53,flatShading:true}),
  chrome:new THREE.MeshLambertMaterial({color:0x8d8890,flatShading:true}),
  wood:new THREE.MeshLambertMaterial({color:0x44343d,flatShading:true}),
  neon:new THREE.MeshBasicMaterial({color:0xfb986c}),
  red:new THREE.MeshBasicMaterial({color:0xd85668}),
  dark:new THREE.MeshLambertMaterial({color:0x25222e,flatShading:true})
 };
 private box(parent:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,material:THREE.Material){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z);mesh.castShadow=false;mesh.receiveShadow=false;parent.add(mesh);return mesh;
 }
 private sign(text:string,width:number,height:number,px:number,py:number,pz:number,highlight='#ffa46c'){
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=32;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.fillStyle='#241923';ctx.fillRect(0,0,128,32);
  ctx.strokeStyle=highlight;ctx.strokeRect(1,1,126,30);
  ctx.font='bold 12px monospace';ctx.fillStyle='#fee4ae';ctx.textAlign='center';
  ctx.textBaseline='middle';ctx.fillText(text,64,16,120);
  const texture=new THREE.CanvasTexture(canvas);texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;texture.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
  const mesh=this.box(this.scenery,width,height,.025,px,py,pz,material);
  return mesh;
 }
 constructor(){
  this.group.name='THE_LAST_LIGHT_1992';
  this.scenery.name='DINER_STATIC';
  this.group.add(this.scenery,this.ticket,this.breaker,this.ledger,this.keypad,this.freezer,this.mara,this.threat);
  this.group.visible=false;
  const m=this.colors,b=this.box.bind(this);
  // Low-poly structure, entrance gap facing the road at z25.
  b(this.scenery,15.5,.22,18.8,-31,0,16.9,m.tile);
  b(this.scenery,.46,4.7,18.4,-38.5,2.35,16.9,m.wall);
  b(this.scenery,.46,4.7,18.4,-23.5,2.35,16.9,m.wall);
  b(this.scenery,15.5,4.7,.46,-31,2.35,8,m.wall);
  b(this.scenery,6.6,4.7,.42,-35.5,2.35,25.9,m.wall);
  b(this.scenery,6.6,4.7,.42,-26.5,2.35,25.9,m.wall);
  b(this.scenery,15.2,.24,18.3,-31,4.85,16.9,m.roof);
  // Road-front canopy and original neon.
  b(this.scenery,15.8,.28,2.1,-31,4.25,26.1,m.wood);
  this.neon=b(this.scenery,6.4,.9,.14,-31,4.14,26.86,m.neon);
  this.sign('THE LAST LIGHT',6.15,.73,-31,4.13,26.98);
  this.sign('OPEN 24H · 1992',3.3,.46,-25.9,3.25,26.12,'#cc6886');
  // Inside: table seating, checkerboard floor, steel counter and stools.
  for(let x=-37.8;x<=-24.2;x+=2.4)for(let z=9.5;z<=24.2;z+=2.4){
   const alternate=(Math.round((x+37.8)/2.4)+Math.round((z-9.5)/2.4))%2===0;
   b(this.scenery,2.35,.014,2.35,x,.115,z,alternate?m.tile:m.wood);
  }
  for(const z of [10.7,14.0]){
   b(this.scenery,1.55,.72,1.7,-37,0.52,z,m.booth);
   b(this.scenery,1.55,.07,1.7,-37,1.05,z,m.chrome);
   b(this.scenery,1.1,.08,1.15,-35.1,1.05,z,m.wood);
  }
  b(this.scenery,1.85,1.05,6.1,-25.8,.58,16.1,m.chrome);
  b(this.scenery,.34,.19,2.0,-25.8,1.22,17,m.wood);
  for(const z of [14,16,18]){
   const seat=new THREE.Mesh(new THREE.CylinderGeometry(.46,.46,.15,7),m.booth);
   seat.position.set(-28.0,.73,z);this.scenery.add(seat);
   b(this.scenery,.16,.69,.16,-28,.37,z,m.chrome);
  }
  // Kitchen barrier with an entrance in the center; colliders match dinerCollision.ts.
  b(this.scenery,6.8,3.5,.35,-35.5,1.75,12.7,m.wood);
  b(this.scenery,5.2,3.5,.35,-25.6,1.75,12.7,m.wood);
  this.sign('SOLO PERSONAL',3.2,.45,-25.9,2.28,12.94,'#c5757b');
  b(this.scenery,2.7,1.2,1.4,-26,1.05,9.8,m.chrome);
  // Quiet environmental story dressing: coffee machine, overturned chairs, plates.
  for(const [x,z] of [[-34,20],[-29.5,20],[-34,17.7]]){
   b(this.scenery,.72,.05,.72,x,.89,z,m.chrome);
   b(this.scenery,.10,.57,.10,x,.58,z,m.wood);
  }
  for(let i=0;i<7;i++)b(this.scenery,.34,.06,.34,-37.5+i*1.45,.145,9.08,i%2?m.red:m.chrome);
  // Quest items each have their own removable group.
  this.ticket.position.set(DINER_POSITIONS.menu.x,0,DINER_POSITIONS.menu.z);
  b(this.ticket,.84,.035,.56,0,1.18,0,m.neon);
  b(this.ticket,.55,.025,.34,0,1.21,0,m.wood);
  this.breaker.position.set(DINER_POSITIONS.breaker.x,0,DINER_POSITIONS.breaker.z);
  b(this.breaker,.83,1.05,.24,0,1.73,0,m.chrome);
  b(this.breaker,.43,.40,.10,0,1.81,.18,m.red);
  this.ledger.position.set(DINER_POSITIONS.ledger.x,0,DINER_POSITIONS.ledger.z);
  b(this.ledger,.75,.07,.54,0,1.27,0,m.wood);
  b(this.ledger,.62,.02,.38,0,1.315,0,m.neon);
  this.keypad.position.set(DINER_POSITIONS.keypad.x,0,DINER_POSITIONS.keypad.z);
  b(this.keypad,.76,1.2,.24,0,1.85,0,m.chrome);
  for(let i=0;i<4;i++)b(this.keypad,.15,.12,.12,-.22+(i%2)*.42,1.85+Math.floor(i/2)*.3,.18,m.red);
  this.freezer.position.set(DINER_POSITIONS.freezer.x,0,DINER_POSITIONS.freezer.z);
  b(this.freezer,1.95,2.3,1.1,0,1.15,0,m.chrome);
  b(this.freezer,1.65,1.65,.08,0,1.18,.60,m.dark);
  b(this.freezer,.15,.55,.12,.65,1.36,.70,m.red);
  // MARA, a silent silhouette at the window; diesgetic dialogue via choice modal.
  this.mara.position.set(DINER_POSITIONS.mara.x,0,DINER_POSITIONS.mara.z);
  b(this.mara,.56,1.17,.44,0,1.05,0,m.booth);
  b(this.mara,.43,.39,.36,0,1.86,0,m.chrome);
  b(this.mara,.52,.16,.38,0,2.1,0,m.dark);
  for(const x of [-.18,.18])b(this.mara,.15,.64,.2,x,.36,0,m.dark);
  // Enemy: single eye / empty apron, mechanically different from Celador.
  b(this.threat,.95,1.22,.66,0,1.15,0,m.booth);
  b(this.threat,.49,.45,.48,0,2.0,0,m.chrome);
  b(this.threat,.7,.1,.48,0,2.31,0,m.dark);
  for(const x of [-.67,.67])b(this.threat,.16,1.25,.22,x,1.05,0,m.chrome);
  for(const x of [-.22,.22])b(this.threat,.2,.78,.22,x,.38,0,m.dark);
  this.threatEye=b(this.threat,.32,.11,.06,0,2.04,-.265,m.red);
  this.threat.visible=false;
  this.setStage('locked',false);
 }
 setStage(stage:DinerStage,maraMet:boolean){
  this.ticket.visible=stage==='arrival';
  this.breaker.visible=stage==='breaker';
  this.ledger.visible=stage==='ledger';
  this.keypad.visible=stage==='code';
  this.freezer.visible=stage==='freezer'||stage==='stalker'||stage==='choice';
  this.mara.visible=!maraMet&&stage!=='locked'&&stage!=='complete';
  this.threat.visible=stage==='stalker';
  (this.neon.material as THREE.MeshBasicMaterial).color.setHex(['locked','arrival','breaker'].includes(stage)?0x723946:0xfb986c);
 }
 setThreat(x:number,z:number,visible:boolean,windup:boolean,elapsed:number){
  this.threat.visible=visible;
  if(!visible)return;
  this.threat.position.set(x,Math.sin(elapsed*3)*.045,z);
  (this.threatEye.material as THREE.MeshBasicMaterial).color.setHex(windup?0xffffaa:0xd85668);
  this.threatEye.scale.x=windup?1.65:1;
 }
}
