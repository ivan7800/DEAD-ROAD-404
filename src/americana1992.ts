import * as THREE from 'three';

/** Fase 13. Decorado ORIGINAL: las marcas y los rótulos son ficticios.
 * El decorado no modifica la geometría de navegación de la misión existente.
 */
const noir = new THREE.MeshStandardMaterial({color:0x171820,roughness:.78,metalness:.35});
const trim = new THREE.MeshStandardMaterial({color:0x745d4d,roughness:.82,metalness:.24});
const rust = new THREE.MeshStandardMaterial({color:0x7a4238,roughness:.95,metalness:.25});
const paper = new THREE.MeshStandardMaterial({color:0xc6b494,roughness:1});
const cyan = new THREE.MeshBasicMaterial({color:0x65a6a5});
const amber = new THREE.MeshBasicMaterial({color:0xd9954a});
const screen = new THREE.MeshBasicMaterial({color:0x91b98a});
const glass = new THREE.MeshStandardMaterial({color:0x397a83,transparent:true,opacity:.33,roughness:.15,metalness:.07,side:THREE.DoubleSide,depthWrite:false});
function box(p:THREE.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material){
 const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;
}
function label(lines:string[],foreground:string,background:string,glow=0):THREE.MeshBasicMaterial{
 const c=document.createElement('canvas');c.width=512;c.height=256;
 const ctx=c.getContext('2d');if(!ctx)throw new Error('Canvas no disponible para la rotulación original');
 ctx.fillStyle=background;ctx.fillRect(0,0,512,256);
 ctx.strokeStyle=foreground;ctx.lineWidth=7;ctx.strokeRect(17,17,478,222);
 ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=foreground;
 lines.forEach((line,i)=>{ctx.font=`900 ${lines.length>1?(i===0?69:35):73}px Impact, 'Arial Narrow', sans-serif`;
   ctx.fillText(line,256,lines.length>1?98+i*90:129,460);});
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.magFilter=THREE.NearestFilter;
 return new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,transparent:false,color:0xffffff,toneMapped:glow===0});
}
function poster(p:THREE.Object3D,w:number,h:number,x:number,y:number,z:number,m:THREE.Material,rot=0){
 const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);o.position.set(x,y,z);o.rotation.y=rot;p.add(o);return o;
}
function phoneBooth(p:THREE.Object3D){
 const g=new THREE.Group();g.position.set(27,0,3);p.add(g);
 box(g,1.42,.17,1.22,0,.13,0,noir);box(g,1.42,.18,1.22,0,3.05,0,rust);
 for(const x of [-.64,.64])for(const z of [-.54,.54])box(g,.10,2.75,.10,x,1.55,z,trim);
 for(const x of [-.65,.65])box(g,.07,2.30,1, x,1.55,0,glass);
 box(g,1.21,.32,.12,0,2.82,.56,noir);
 poster(g,1.1,.27,0,2.83,.632,label(['TELEPHONE'],'#e3d0aa','#423340'));
 box(g,.63,1.15,.14,0,1.6,-.42,noir);box(g,.41,.30,.03,0,1.87,-.335,trim);
 box(g,.29,.11,.16,-.04,1.63,-.28,noir);box(g,.05,.43,.08,.20,1.62,-.28,screen);
 const lamp=new THREE.PointLight(0x65a6a5,2.4,3);lamp.position.set(0,2.7,.45);g.add(lamp);
 return g;
}
function vendingMachine(p:THREE.Object3D){
 const g=new THREE.Group();g.position.set(23.8,0,-.2);p.add(g);
 box(g,1.35,2.5,1.02,0,1.3,0,rust);
 poster(g,1.12,1.36,0,1.53,.522,label(['DUSTLINE','COLA'],'#e3d0aa','#7a2936'));
 box(g,.24,.55,.11,.36,.45,.53,noir);box(g,.3,.12,.13,-.24,.42,.53,noir);
 box(g,1.15,.09,.1,0,2.58,.52,trim);
 const glow=new THREE.PointLight(0xb83d42,1.8,4);glow.position.set(0,1.7,.8);g.add(glow);
 return g;
}
function iceMachine(p:THREE.Object3D){
 const g=new THREE.Group();g.position.set(25.2,0,7.2);p.add(g);
 box(g,1.7,2.05,1.25,0,1.05,0,paper);box(g,1.4,1.08,.08,0,1.29,.67,glass);
 poster(g,1.32,.43,0,1.95,.685,label(['ICE'],'#65a6a5','#15212a'));
 box(g,1.5,.12,.06,0,.54,.67,trim);
}
function dinerSigns(p:THREE.Object3D){
 const signage=new THREE.Group();signage.name='LegacySignage';p.add(signage);
 // Fachada de la gasolinera, orientada hacia el aparcamiento (+Z).
 box(signage,9.2,1.27,.23,15,6.05,1.33,noir);
 poster(signage,8.7,1.07,15,6.05,1.467,label(['SUNSPUR','FUEL & SERVICE'],'#e7b573','#2b1d2a',1));
 // Motel (la habitación jugable conserva su puerta y colisiones).
 box(signage,6.4,1.40,.18,-20,4.27,-40.45,noir);
 poster(signage,6.07,1.16,-20,4.27,-40.34,label(['MILE 404','MOTEL · VACANCY'],'#dd8a82','#281a26',1));
 // Publicidad de videoclub en lateral visible desde la carretera.
 box(signage,4.3,2.1,.15,-10,3.45,-31.5,trim);
 poster(signage,4.05,1.86,-10,3.45,-31.39,label(['NOCTURNE','VIDEO · VHS'],'#91b98a','#27252b'));
}
function motelProps(p:THREE.Object3D){
 // Elementos interiores ligeros, alejados de la cinta magnética y del umbral.
 const g=new THREE.Group();p.add(g);
 box(g,.78,.82,.60,-17.6,.45,-48.1,trim);
 box(g,.67,.49,.28,-17.6,1.02,-48.1,noir);
 box(g,.56,.36,.03,-17.6,1.06,-47.936,screen);
 for(let i=0;i<3;i++)box(g,.08,.035,.05,-17.84+i*.19,.76,-47.938,amber);
 box(g,.35,.13,.22,-21,1.03,-47.99,noir);
 box(g,.23,.07,.10,-21,1.13,-47.99,trim);
 // Máquina de hielo junto al motel: dirección visual, no colisión nueva en la zona jugable.
 box(g,1.2,1.8,1.1,-13.4,.95,-43.8,paper);
 poster(g,1,.45,-13.4,1.53,-43.22,label(['ICE'],'#e3d0aa','#423340'));
}
function asphaltMarks(p:THREE.Object3D){
 const old=new THREE.MeshBasicMaterial({color:0xb69a78});
 for(let i=0;i<7;i++)box(p,.12,.012,1.6,11+i*1.7,.048,14,old);
 for(let i=0;i<4;i++)box(p,.1,.012,2.3,23+i*2.4,.045,11,old);
 // Zonas más oscuras sugieren aceite bajo surtidores; materiales propios.
 const oil=new THREE.MeshBasicMaterial({color:0x171519,transparent:true,opacity:.56,depthWrite:false});
 for(const x of [12,18]){const o=new THREE.Mesh(new THREE.CircleGeometry(.78,14),oil);o.rotation.x=-Math.PI/2;o.scale.set(1.4,.6,1);o.position.set(x,.07,6.3);p.add(o);}
}
/** Un decorado ensamblado una vez. `setTime` anima la señal luminosa opcional. */
export class Americana1992 {
 readonly group=new THREE.Group();
 private motelSign:THREE.PointLight;
 private crt:THREE.PointLight;
 constructor(){
  const g=this.group;dinerSigns(g);phoneBooth(g);vendingMachine(g);iceMachine(g);motelProps(g);asphaltMarks(g);
  this.motelSign=new THREE.PointLight(0xb83d42,7,15,2);this.motelSign.position.set(-20,4,-40);g.add(this.motelSign);
  this.crt=new THREE.PointLight(0x65a6a5,2.1,4,2);this.crt.position.set(-17.5,1.3,-47.7);g.add(this.crt);
 }
 setTime(seconds:number,reducedMotion:boolean){
  if(reducedMotion){this.crt.intensity=1.6;this.motelSign.intensity=6;return;}
  this.crt.intensity=1.6+Math.sin(seconds*10.2)*.27;
  this.motelSign.intensity=(Math.sin(seconds*1.5)>-.86)?6.7:2.2;
 }
}
