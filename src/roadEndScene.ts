import * as THREE from 'three';
import {END_POSITIONS,type RoadEndStage} from './chapterSix.ts';
/** Final kilometre, built entirely from original low-poly primitives and pixelated signs. */
export class RoadEndScene{
 readonly group=new THREE.Group();readonly scenery=new THREE.Group();
 readonly sign=new THREE.Group();readonly ledger=new THREE.Group();
 readonly relayA=new THREE.Group();readonly relayB=new THREE.Group();
 readonly console=new THREE.Group();readonly supplies=new THREE.Group();
 readonly double=new THREE.Group();private eye:THREE.Mesh;
 private readonly m={
  ash:new THREE.MeshBasicMaterial({color:0x302c39}),
  asphalt:new THREE.MeshBasicMaterial({color:0x17171f}),
  silver:new THREE.MeshBasicMaterial({color:0x8e858b}),
  rust:new THREE.MeshBasicMaterial({color:0x884c53}),
  bone:new THREE.MeshBasicMaterial({color:0xd4c5ac}),
  warning:new THREE.MeshBasicMaterial({color:0xc66c51}),
  dark:new THREE.MeshBasicMaterial({color:0x25222d})
 };
 private box(g:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  mesh.position.set(x,y,z);g.add(mesh);return mesh;
 }
 private label(g:THREE.Group,text:string,x:number,y:number,z:number,w=3){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.fillStyle='#16141c';ctx.fillRect(0,0,256,64);
  ctx.lineWidth=4;ctx.strokeStyle='#ba684d';ctx.strokeRect(2,2,252,60);
  ctx.fillStyle='#f3d7ba';ctx.font='bold 24px monospace';ctx.textBaseline='middle';ctx.textAlign='center';
  ctx.fillText(text,128,32,249);
  const tex=new THREE.CanvasTexture(canvas);tex.minFilter=THREE.NearestFilter;tex.magFilter=THREE.NearestFilter;tex.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,.7),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
  mesh.position.set(x,y,z);g.add(mesh);
 }
 constructor(){
  const b=this.box.bind(this),m=this.m;
  this.group.name='ROAD_END_120_FINAL_SCENE_PSX';
  this.group.add(this.scenery,this.sign,this.ledger,this.relayA,this.relayB,this.console,this.supplies,this.double);
  b(this.scenery,30,.12,82,0,-.12,-30,m.ash);
  b(this.scenery,14,.10,80,0,-.03,-30,m.asphalt);
  for(let z=-4;z>-64;z-=7)b(this.scenery,.2,.03,2.8,0,.025,z,m.bone);
  // Slender repeated toll arches frame the never-ending lane.
  for(const z of [-13,-27,-47,-62]){
   for(const x of [-8.5,8.5])b(this.scenery,.42,4.7,.45,x,2.3,z,m.rust);
   b(this.scenery,17.3,.42,.45,0,4.5,z,m.silver);
   this.label(this.scenery,z===-62?'NO HAY RETORNO':'ULTIMO DESVIO',0,4.1,z+.26,5.3);
  }
  for(const x of [-11,11]){
   for(const z of [-7,-22,-38,-55]){
    const o=new THREE.Mesh(new THREE.ConeGeometry(1.1,3.6,5),m.dark);
    o.position.set(x,1.7,z);o.rotation.z=x<0?.2:-.2;this.scenery.add(o);
   }
  }
  const pos=(g:THREE.Group,id:keyof typeof END_POSITIONS)=>{
   const p=END_POSITIONS[id];g.position.set(p.x,0,p.z);
  };
  pos(this.sign,'sign');
  b(this.sign,3.8,2.6,.25,0,1.35,0,m.rust);
  this.label(this.sign,'KM120 / RUTA404',0,2.1,.19,3.6);
  pos(this.ledger,'ledger');
  b(this.ledger,3.3,1.5,1.5,0,.78,0,m.dark);
  this.label(this.ledger,'PEAJE · 1992',0,1.9,.83,2.9);
  for(const id of ['relayA','relayB'] as const){
   const g=this[id];pos(g,id);b(g,.8,2.4,.8,0,1.3,0,m.silver);
   b(g,1.2,.35,.8,0,2.55,0,m.warning);
   this.label(g,id==='relayA'?'RELE A':'RELE B',0,1.4,.49,1.5);
  }
  pos(this.console,'console');
  b(this.console,4.4,1.75,1.1,0,.9,0,m.dark);
  b(this.console,3.8,.25,.9,0,1.8,0,m.silver);
  this.label(this.console,'120 / 404',0,2.2,.61,3.5);
  pos(this.supplies,'supplies');b(this.supplies,1.25,.82,1.1,0,.45,0,m.rust);
  b(this.supplies,.8,.11,.8,0,.9,0,m.bone);
  b(this.double,.82,1.55,.55,0,1.4,0,m.dark);
  b(this.double,1.18,.5,.65,0,2.32,0,m.rust);
  b(this.double,.67,.65,.55,0,2.78,0,m.silver);
  for(const x of [-.34,.34])b(this.double,.2,.8,.18,x,.49,0,m.dark);
  this.eye=b(this.double,.5,.17,.12,0,2.74,-.35,m.warning);
  this.group.visible=false;this.setStage('locked',0,false);
 }
 setStage(stage:RoadEndStage,mask:number,suppliesTaken:boolean){
  this.sign.visible=stage==='arrival';this.ledger.visible=stage==='ledger';
  this.relayA.visible=stage==='relays'&&(mask&1)===0;
  this.relayB.visible=stage==='relays'&&(mask&2)===0;
  this.console.visible=stage==='cipher';
  this.supplies.visible=stage!=='locked'&&stage!=='complete'&&!suppliesTaken;
  this.double.visible=stage==='double';
 }
 setDouble(x:number,z:number,visible:boolean,telegraph:boolean,time:number){
  this.double.visible=visible;if(!visible)return;
  this.double.position.set(x,Math.sin(time*3)*.04,z);
  (this.eye.material as THREE.MeshBasicMaterial).color.setHex(telegraph?0xffddaa:0xcf574a);
 }
}
