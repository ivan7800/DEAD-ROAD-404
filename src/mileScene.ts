import * as THREE from 'three';
import {MILE_POSITIONS,type MileStage} from './chapterFive.ts';
/** F26: self-contained kilometre-96 PSX scene. Original procedural assets only. */
export class MileScene {
 readonly group=new THREE.Group();
 readonly scenery=new THREE.Group();readonly sign=new THREE.Group();readonly log=new THREE.Group();
 readonly beaconA=new THREE.Group();readonly beaconB=new THREE.Group();readonly dial=new THREE.Group();
 readonly supplies=new THREE.Group();readonly hunter=new THREE.Group();private eye:THREE.Mesh;
 private readonly materials={
  sand:new THREE.MeshBasicMaterial({color:0x55404d}),
  road:new THREE.MeshBasicMaterial({color:0x252632}),
  salt:new THREE.MeshBasicMaterial({color:0x7f777f}),
  rust:new THREE.MeshBasicMaterial({color:0x89575b}),
  white:new THREE.MeshBasicMaterial({color:0xe2ccaa}),
  amber:new THREE.MeshBasicMaterial({color:0xd9a76a}),
  dark:new THREE.MeshBasicMaterial({color:0x1c1b26})
 };
 private box(parent:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
 }
 private label(parent:THREE.Group,text:string,x:number,y:number,z:number,w=3){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=64;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.fillStyle='#191925';ctx.fillRect(0,0,256,64);ctx.strokeStyle='#caa66f';ctx.lineWidth=4;ctx.strokeRect(3,3,250,58);
  ctx.fillStyle='#f8dab3';ctx.font='bold 25px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,128,33,244);
  const texture=new THREE.CanvasTexture(canvas);texture.minFilter=THREE.NearestFilter;texture.magFilter=THREE.NearestFilter;
  texture.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,.75),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
  mesh.position.set(x,y,z);parent.add(mesh);
 }
 constructor(){
  const b=this.box.bind(this),m=this.materials;
  this.group.name='KM96_IMPOSSIBLE_MILE_PSX';
  this.group.add(this.scenery,this.sign,this.log,this.beaconA,this.beaconB,this.dial,this.supplies,this.hunter);
  b(this.scenery,32,.13,83,0,-.09,-30,m.sand);
  b(this.scenery,14,.12,80,0,-.01,-30,m.road);
  for(let z=-5;z>-64;z-=7)b(this.scenery,.18,.04,3,0,.08,z,m.white);
  for(let x of [-8,8]){
   for(let z=-4;z>-62;z-=11){
    b(this.scenery,.17,1.1,.19,x,.55,z,m.rust);
    b(this.scenery,.47,.18,.34,x,1.08,z,m.amber);
   }
  }
  for(const z of [-10,-25,-48]){
   b(this.scenery,.19,3,.19,-9,1.5,z,m.rust);
   b(this.scenery,2,.85,.15,-9,2.7,z,m.dark);
   this.label(this.scenery,'KM 96',-9,2.7,z+.1,1.9);
  }
  // A slanted geometrical horizon: repetition, never a fake screenshot.
  for(const x of [-12,12]){
   for(const z of [-14,-35,-56]){
    const rock=new THREE.Mesh(new THREE.ConeGeometry(2.2,4,5),m.salt);
    rock.rotation.z=x>0?-.24:.24;rock.position.set(x,1.1,z);this.scenery.add(rock);
   }
  }
  const pos=(g:THREE.Group,id:keyof typeof MILE_POSITIONS)=>{const p=MILE_POSITIONS[id];g.position.set(p.x,0,p.z);};
  pos(this.sign,'sign');b(this.sign,3.1,2.6,.2,0,1.3,0,m.rust);this.label(this.sign,'KM 96  /  96',0,2,0.2,3);
  pos(this.log,'log');b(this.log,2.9,1.2,1.45,0,.65,0,m.rust);
  b(this.log,2.5,.1,.85,0,1.31,.15,m.white);this.label(this.log,'PATRULLA 404',0,1.95,.74,2.4);
  for(const id of ['beaconA','beaconB'] as const){
   const g=this[id];pos(g,id);b(g,.7,2.4,.7,0,1.2,0,m.salt);
   b(g,1,.35,.75,0,2.53,0,m.amber);
   this.label(g,id==='beaconA'?'BALIZA A':'BALIZA B',0,1.5,.4,1.45);
  }
  pos(this.dial,'dial');b(this.dial,3.8,1.4,1.1,0,.72,0,m.rust);
  b(this.dial,3.2,.15,.9,0,1.47,0,m.salt);
  this.label(this.dial,'72 - 96 = ?',0,1.88,.55,3);
  pos(this.supplies,'supplies');b(this.supplies,1.25,.8,1,0,.45,0,m.dark);
  b(this.supplies,1,.15,.72,0,.92,0,m.amber);
  this.eye=b(this.hunter,.48,.2,.12,0,2.64,-.34,m.amber);
  b(this.hunter,.82,1.7,.62,0,1.45,0,m.rust);b(this.hunter,1.22,.66,.62,0,2.37,0,m.dark);
  for(const x of [-.34,.34])b(this.hunter,.19,.8,.2,x,.47,0,m.salt);
  const crown=new THREE.Mesh(new THREE.ConeGeometry(.54,.87,5),m.salt);
  crown.position.set(0,3,0);this.hunter.add(crown);
  this.group.visible=false;this.setStage('locked',0,false);
 }
 setStage(stage:MileStage,mask:number,cacheTaken:boolean){
  this.sign.visible=stage==='arrival';
  this.log.visible=stage==='log';
  this.beaconA.visible=stage==='beacons'&&(mask&1)===0;
  this.beaconB.visible=stage==='beacons'&&(mask&2)===0;
  this.dial.visible=stage==='dial';
  this.supplies.visible=stage!=='locked'&&stage!=='complete'&&!cacheTaken;
  this.hunter.visible=stage==='hunter';
 }
 setHunter(x:number,z:number,visible:boolean,telegraph:boolean,time:number){
  this.hunter.visible=visible;if(!visible)return;
  this.hunter.position.set(x,Math.sin(time*3)*.03,z);
  (this.eye.material as THREE.MeshBasicMaterial).color.setHex(telegraph?0xffe4ba:0xba564b);
 }
}
