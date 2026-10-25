import * as THREE from 'three';
/** Tiny hand-drawn diegetic signage, no GLB assets or sprite downloads. */
export function createPSXSignage():THREE.Group{
 const group=new THREE.Group();group.name='PSX_SIGNAGE_1992';
 function create(title:string,subtitle:string,w:number,h:number,x:number,y:number,z:number,tint:string){
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=48;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  ctx.fillStyle='#20131f';ctx.fillRect(0,0,128,48);
  ctx.strokeStyle=tint;ctx.lineWidth=3;ctx.strokeRect(2,2,124,44);
  ctx.fillStyle='#f4c58a';ctx.font='bold 18px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(title,64,19,120);
  ctx.fillStyle=tint;ctx.font='bold 8px monospace';ctx.fillText(subtitle,64,37,120);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
  plane.position.set(x,y,z);group.add(plane);
 }
 create('SUNSPUR','FUEL / 24 HOURS',6.8,1.5,15,4.25,1.82,'#ef9b65');
 create('SUNSPUR','NEXT EXIT 404',4.4,1.85,6,8,-7.52,'#eb7b50');
 create('MILE 404','NO VACANCY',4.8,1.1,-20,3.65,-40.45,'#e69c83');
 create('CARRETERA','SIN RETORNO',3.2,1.2,-7,5.45,-18.58,'#f5b472');
 return group;
}
