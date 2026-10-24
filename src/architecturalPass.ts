import * as THREE from 'three';

/** Art-pass geometry: original 1992 gas station / motel architecture.
 * Does not add gameplay colliders. All major solidity comes from worldCollision.ts.
 * Keeping surface assets separate from physics prevents invisible-wall regressions.
 */
const rust = new THREE.MeshStandardMaterial({color:0x603c39,roughness:.91,metalness:.1});
const concrete = new THREE.MeshStandardMaterial({color:0x98908a,roughness:1});
const trim = new THREE.MeshStandardMaterial({color:0xb27a58,roughness:.65,metalness:.23});
const pale = new THREE.MeshStandardMaterial({color:0xc2a78c,roughness:1});
const glass = new THREE.MeshPhysicalMaterial({color:0x9cbbbf,roughness:.16,metalness:.05,transparent:true,opacity:.43,depthWrite:false});
const neon = new THREE.MeshBasicMaterial({color:0xffb768});
const shade = new THREE.MeshStandardMaterial({color:0x2c2a31,roughness:.92});
function mesh(parent:THREE.Object3D, geo:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number){
 const out=new THREE.Mesh(geo,material);out.position.set(x,y,z);out.castShadow=false;out.receiveShadow=true;parent.add(out);return out;
}
function slab(parent:THREE.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material){return mesh(parent,new THREE.BoxGeometry(w,h,d),mat,x,y,z);}
function pipe(parent:THREE.Object3D,points:Array<[number,number,number]>,radius:number,mat:THREE.Material){
 const path=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v)));return mesh(parent,new THREE.TubeGeometry(path,30,radius,7,false),mat,0,0,0);
}
function signTexture(title:string,detail:string,primary:string,secondary:string):THREE.CanvasTexture{
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D no disponible');
 const bg=ctx.createLinearGradient(0,0,1024,256);bg.addColorStop(0,'#2b1b24');bg.addColorStop(1,'#100f1a');
 ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);
 ctx.strokeStyle=secondary;ctx.lineWidth=12;ctx.strokeRect(16,16,992,224);
 ctx.fillStyle=primary;ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor=primary;ctx.shadowBlur=25;
 ctx.font='bold 110px Impact, Arial Narrow, sans-serif';ctx.fillText(title,512,112,940);
 ctx.shadowBlur=0;ctx.fillStyle='#edd9b8';ctx.font='bold 33px Arial,sans-serif';ctx.fillText(detail,512,206,900);
 // Screenprinted streaks and scrapes; deterministic to avoid flickering across loads.
 for(let i=0;i<100;i++){const x=(i*173)%1000+12,y=(i*37)%238+8;
  ctx.fillStyle=i%3===0?'rgba(247,223,190,.045)':'rgba(0,0,0,.15)';ctx.fillRect(x,y,(i%7)+3,i%4===0?9:2);}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=2;return texture;
}
function billboard(parent:THREE.Object3D,title:string,sub:string,color:string,x:number,y:number,z:number,w:number,h:number){
 const tx=signTexture(title,sub,color,'#b9865f');
 const mat=new THREE.MeshBasicMaterial({map:tx,side:THREE.FrontSide});
 slab(parent,w+.18,h+.16,.22,x,y,z-.12,shade);
 const sign=mesh(parent,new THREE.PlaneGeometry(w,h),mat,x,y,z+.015);
 sign.userData.generatedTexture=tx;
}
export class ArchitecturalPass{
 readonly group=new THREE.Group();
 constructor(){this.buildStation();this.buildMotel();this.buildRoad();}
 private buildStation(){
  const g=this.group;
  // The store has an open central doorway. New facade layers respect it.
  for(const x of [10.5,19.5]){
   // Spandrels only: never cover the existing storefront windows with solid masonry.
   slab(g,4.8,.32,.11,x,1.03,1.52,concrete);
   slab(g,4.8,.22,.11,x,3.42,1.52,concrete);
   slab(g,4.65,.14,.14,x,3.33,1.65,trim);
   for(let i=0;i<5;i++)slab(g,.065,2.05,.065,x-1.94+i*.96,2.12,1.67,rust);
  }
  // Old storefront awning, stepped fascia and tiled canopy underside.
  slab(g,16.6,.14,.85,15,4.93,1.45,rust);
  slab(g,16.9,.09,.12,15,4.70,1.94,trim);
  slab(g,16.3,.13,.44,15,5.18,.66,concrete);
  billboard(g,'SUNSPUR','FUEL  ·  OPEN 24 HOURS', '#f8ab64',15,4.43,1.85,8.3,1.15);
  for(let i=0;i<9;i++)slab(g,.09,.045,.68,8.2+i*1.7,4.82,1.36,pale);
  // Suspended lights as slanted mouldings (not abstract floating boxes).
  for(const x of [10.15,19.85]){
   slab(g,.16,2.8,.17,x,2.1,1.62,rust);
   pipe(g,[[x-.25,3.2,1.71],[x,3.75,1.71],[x+.25,3.2,1.71]],.035,trim);
  }
  // Forecourt canopy roof, weathered edge and pump hoses.
  slab(g,16.7,.30,6.55,15,4.72,6.4,shade);
  slab(g,16.8,.23,.18,15,4.56,9.82,trim);
  slab(g,16.8,.23,.18,15,4.56,3.02,trim);
  for(const x of [12,18]){
   pipe(g,[[x+.45,1.36,6.7],[x+.66,.84,7.06],[x+.57,.51,6.57]],.055,shade);
   slab(g,.18,.32,.24,x+.52,.75,6.70,rust);
   slab(g,.35,.12,.44,x,2.10,6.4,neon);
  }
  // Ground paint, rounded raised pump islands with angled corners.
  const shape=new THREE.Shape();shape.moveTo(-1.2,-.45);shape.lineTo(.95,-.45);shape.lineTo(1.2,-.20);
  shape.lineTo(1.2,.25);shape.lineTo(.95,.45);shape.lineTo(-.95,.45);shape.lineTo(-1.2,.20);shape.closePath();
  for(const x of [12,18]){
   const island=mesh(g,new THREE.ExtrudeGeometry(shape,{depth:.14,bevelEnabled:true,bevelSize:.05,bevelThickness:.04,bevelSegments:2}),concrete,x,.03,6.3);
   island.rotation.x=-Math.PI/2;
  }
  // Framed, framed glass windows on sides of entrance; asymmetry adds believability.
  for(const x of [11.15,18.65]){
   slab(g,2.35,1.4,.04,x,2.18,1.74,glass);
   slab(g,2.50,.07,.09,x,2.94,1.79,rust);
   slab(g,2.50,.07,.09,x,1.43,1.79,rust);
   slab(g,.07,1.5,.09,x,2.2,1.79,rust);
  }
  // Metal ventilation ducting and corner roof units.
  for(const x of [11,20]){
   slab(g,1.7,.65,1.15,x,5.78,-7.8,shade);
   const fan=mesh(g,new THREE.CylinderGeometry(.34,.34,.07,12),trim,x,6.17,-7.8);fan.rotation.x=Math.PI/2;
  }
 }
 private buildMotel(){
  const g=this.group;
  // Motel's shallow porch / verandah protects the doorway and grounds the facade.
  slab(g,9.1,.16,2.6,-20,.1,-39.8,concrete);
  slab(g,9.7,.24,1.55,-20,3.29,-40.1,shade);
  slab(g,9.8,.08,.10,-20,3.09,-39.28,trim);
  for(const x of [-23.5,-16.5]){
   slab(g,.18,3.0,.19,x,1.53,-39.65,rust);
   slab(g,.40,.26,.45,x,3.03,-39.65,concrete);
  }
  billboard(g,'MILE 404','MOTEL  ·  NO VACANCY', '#f45a70',-20,3.78,-40.14,5.2,.9);
  for(const x of [-22.5,-17.5]){
   slab(g,1.95,.13,.12,x,2.7,-40.68,trim);
   slab(g,1.95,.13,.12,x,1.0,-40.68,trim);
   slab(g,.13,1.8,.12,x-1.02,1.85,-40.68,trim);
   slab(g,.13,1.8,.12,x+1.02,1.85,-40.68,trim);
  }
  // Neon vacancy tube and CRT-blue pane draw eye without adding monsters.
  pipe(g,[[-22.2,3.53,-40.10],[-21.5,3.68,-40.10],[-20.7,3.56,-40.10]],.035,neon);
  for(let i=0;i<7;i++)slab(g,.05,.08,1.9,-23.8+i*1.2,.20,-39.8,rust);
 }
 private buildRoad(){
  const g=this.group;
  // Aged concrete kerbs and repair patches: read as road, not giant plain rectangle.
  for(let i=0;i<17;i++){
   const z=-103+i*12;
   for(const x of [-4.54,4.54])slab(g,.16,.085,7.0,x,.034,z,concrete);
   if(i%3===0)slab(g,2.15,.02,1.7,i%2?-1.7:1.8,-.014,z,rust);
  }
 }
}
