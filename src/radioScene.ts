import * as THREE from 'three';
import {RADIO_POSITIONS,type RadioStage} from './chapterFour.ts';
/** Original 1992 station + enclosed UMBRAL bunker. Procedural PSX: no GLB/post FX. */
export class RadioScene {
 readonly group=new THREE.Group();
 readonly surface=new THREE.Group();
 readonly bunker=new THREE.Group();
 readonly surfaceScenery=new THREE.Group();
 readonly bunkerScenery=new THREE.Group();
 readonly sign=new THREE.Group();readonly relay=new THREE.Group();
 readonly archive=new THREE.Group();readonly mixer=new THREE.Group();
 readonly hatch=new THREE.Group();readonly nora=new THREE.Group();
 readonly supplies=new THREE.Group();readonly terminal=new THREE.Group();
 readonly switchA=new THREE.Group();readonly switchB=new THREE.Group();
 readonly bunkerExit=new THREE.Group();readonly operator=new THREE.Group();
 private eye:THREE.Mesh;
 private readonly mat={
  floor:new THREE.MeshBasicMaterial({color:0x49404b}),
  wall:new THREE.MeshBasicMaterial({color:0x75646a}),
  metal:new THREE.MeshBasicMaterial({color:0x989198}),
  wood:new THREE.MeshBasicMaterial({color:0x66545b}),
  dark:new THREE.MeshBasicMaterial({color:0x2f333f}),
  red:new THREE.MeshBasicMaterial({color:0xb94b51}),
  amber:new THREE.MeshBasicMaterial({color:0xdfa872}),
  screen:new THREE.MeshBasicMaterial({color:0x97b9ae})
 };
 private box(p:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material){
  const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  o.position.set(x,y,z);p.add(o);return o;
 }
 private signText(parent:THREE.Group,text:string,x:number,y:number,z:number,w=3.4){
  const c=document.createElement('canvas');c.width=128;c.height=32;
  const ctx=c.getContext('2d');if(!ctx)return;
  ctx.fillStyle='#17131b';ctx.fillRect(0,0,128,32);
  ctx.strokeStyle='#bb8255';ctx.strokeRect(1,1,126,30);
  ctx.fillStyle='#f6d4a6';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(text,64,16,122);
  const tex=new THREE.CanvasTexture(c);tex.magFilter=THREE.NearestFilter;
  tex.minFilter=THREE.NearestFilter;tex.colorSpace=THREE.SRGBColorSpace;
  const o=new THREE.Mesh(new THREE.PlaneGeometry(w,.55),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));
  o.position.set(x,y,z);parent.add(o);
 }
 constructor(){
  const b=this.box.bind(this),m=this.mat;
  this.group.name='WXR404_RADIO_AND_UMBRAL_PSX';
  this.surface.name='WXR404_SURFACE';this.bunker.name='UMBRAL_UNDERGROUND';
  this.surfaceScenery.name='RADIO_STATIC';this.bunkerScenery.name='UMBRAL_STATIC';
  this.group.add(this.surface,this.bunker);
  this.surface.add(this.surfaceScenery,this.sign,this.relay,this.archive,this.mixer,this.hatch,this.nora,this.supplies);
  this.bunker.add(this.bunkerScenery,this.terminal,this.switchA,this.switchB,this.bunkerExit,this.operator);
  // Walkable central corridor at x-22; soundstage and transformer flank it.
  b(this.surfaceScenery,22,.16,34,-22,-.05,-43,m.floor);
  b(this.surfaceScenery,5.1,5,11,-31.2,2.5,-43,m.wall);
  b(this.surfaceScenery,5.5,.32,11.4,-31.2,5.16,-43,m.dark);
  b(this.surfaceScenery,4.8,4.2,10,-12.3,2.1,-43,m.wall);
  b(this.surfaceScenery,5.2,.32,10.5,-12.3,4.34,-43,m.dark);
  this.signText(this.surfaceScenery,'WXR-404 · ON AIR',-31.2,3.75,-37.42,4.7);
  this.signText(this.surfaceScenery,'NO EMITIR · 02:17',-12.3,3.34,-37.91,4.5);
  // A grounded hero sign that immediately identifies the station in first person.
  b(this.surfaceScenery,4.8,1.15,.17,-22,3.25,-53,m.wood);
  this.signText(this.surfaceScenery,'WXR-404 / ON AIR',-22,3.25,-52.85,4.5);
  for(const z of [-33.5,-45.5]){
   for(const x of [-28.4,-15.6]){
    b(this.surfaceScenery,.7,.98,.7,x,.51,z,m.wood);
    b(this.surfaceScenery,.56,.12,.57,x,1.08,z,m.metal);
    b(this.surfaceScenery,.15,.18,.08,x+.25,1.06,z+.3,m.red);
   }
  }
  b(this.surfaceScenery,.4,14,.4,-16,7,-55,m.metal);
  for(const y of [4,7,10,13])b(this.surfaceScenery,5,.12,.19,-16,y,-55,m.metal);
  b(this.surfaceScenery,.85,.42,.55,-16,14.4,-55,m.red);
  for(const z of [-31,-40,-49]){
   for(const x of [-27,-17]){
    b(this.surfaceScenery,.19,4.1,.19,x,2,z,m.metal);
    b(this.surfaceScenery,.85,.18,.38,x,4,z,m.amber);
   }
  }
  const pos=(group:THREE.Group,id:keyof typeof RADIO_POSITIONS)=>{
   const p=RADIO_POSITIONS[id];group.position.set(p.x,0,p.z);
  };
  pos(this.sign,'sign');b(this.sign,2.5,2.4,.32,0,1.2,0,m.wood);
  this.signText(this.sign,'WXR · FRECUENCIA 404',0,1.7,.19,2.3);
  pos(this.relay,'relay');b(this.relay,1.3,1.5,.7,0,.75,0,m.metal);
  b(this.relay,.5,.34,.06,0,1.1,.39,m.red);
  pos(this.archive,'archive');b(this.archive,1.6,1.05,.85,0,.56,0,m.wood);
  b(this.archive,.9,.09,.59,0,1.13,0,m.amber);
  pos(this.mixer,'mixer');b(this.mixer,2.2,1,.95,0,.57,0,m.dark);
  b(this.mixer,1.9,.17,.82,0,1.15,0,m.metal);
  for(let i=0;i<5;i++)b(this.mixer,.16,.12,.22,-.72+i*.35,1.26,0,i%2?m.screen:m.red);
  pos(this.hatch,'hatch');b(this.hatch,2.5,.17,2.5,0,.12,0,m.metal);
  b(this.hatch,2.0,.15,2,0,.22,0,m.dark);
  b(this.hatch,1.2,.11,.12,0,.35,.8,m.amber);
  this.signText(this.surfaceScenery,'PROYECTO UMBRAL',-22,2.7,-58,4.1);
  pos(this.nora,'nora');b(this.nora,.63,1.2,.5,0,1.02,0,m.wood);
  b(this.nora,.49,.47,.43,0,1.9,0,m.metal);
  b(this.nora,.7,.2,.52,0,2.22,0,m.dark);
  for(const x of [-.22,.22])b(this.nora,.16,.7,.19,x,.36,0,m.dark);
  pos(this.supplies,'supplies');b(this.supplies,1,.7,.8,0,.37,0,m.wood);
  b(this.supplies,.7,.12,.45,0,.75,.3,m.screen);
  // Containment bunker is in separate coordinates, inside a windowless envelope.
  b(this.bunkerScenery,18,.18,15,-22,-.06,37,m.floor);
  b(this.bunkerScenery,18,.26,15,-22,3.8,37,m.dark);
  b(this.bunkerScenery,.45,3.9,15,-30.8,1.95,37,m.wall);
  b(this.bunkerScenery,.45,3.9,15,-13.2,1.95,37,m.wall);
  b(this.bunkerScenery,18,3.9,.3,-22,1.95,44,m.wall);
  for(const x of [-27.8,-16.2]){
   for(const z of [34,37.6,41]){
    b(this.bunkerScenery,.9,1.4,.62,x,.72,z,m.wood);
    b(this.bunkerScenery,.65,.34,.05,x,1.24,z+.33,m.screen);
   }
  }
  for(const z of [32.5,36.5,40.5]){
   b(this.bunkerScenery,4.8,.14,.35,-22,3.5,z,m.red);
  }
  this.signText(this.bunkerScenery,'UMBRAL  /  NIVEL -1',-22,2.85,43.8,5.5);
  this.signText(this.bunkerScenery,'CANAL 404 · 03:13',-22,2.45,39.8,4.5);
  b(this.bunkerScenery,4.4,.09,.18,-22,3.26,39.75,m.red);
  pos(this.bunkerExit,'exit');b(this.bunkerExit,2.1,2.35,.27,0,1.2,0,m.metal);
  b(this.bunkerExit,1.55,1.93,.08,0,1.18,.19,m.dark);
  pos(this.terminal,'console');b(this.terminal,1.7,1.44,.75,0,.88,0,m.metal);
  b(this.terminal,1.1,.66,.12,0,1.37,.43,m.screen);
  pos(this.switchA,'breakerA');pos(this.switchB,'breakerB');
  for(const group of [this.switchA,this.switchB]){
   b(group,.85,1.32,.48,0,.9,0,m.metal);
   b(group,.49,.35,.07,0,1.16,.28,m.red);
  }
  b(this.operator,.93,1.73,.58,0,1.24,0,m.wood);
  b(this.operator,1.4,.47,.6,0,2.22,0,m.metal);
  b(this.operator,.61,.62,.52,0,2.72,0,m.dark);
  b(this.operator,1.8,.1,.21,0,3.07,0,m.metal);
  for(const x of [-.7,.7]){
   b(this.operator,.18,1.25,.2,x,1.1,0,m.metal);
   b(this.operator,.2,.75,.24,x*.42,.38,0,m.dark);
  }
  this.eye=b(this.operator,.47,.17,.12,0,2.76,-.32,m.red);
  this.group.visible=false;this.setUnderground(false);
  this.setStage('locked',false,false,0);
 }
 setUnderground(value:boolean){
  this.surface.visible=!value;this.bunker.visible=value;
 }
 setStage(stage:RadioStage,noraMet:boolean,cacheTaken:boolean,mask:number){
  this.sign.visible=stage==='arrival';
  this.relay.visible=stage==='relay';
  this.archive.visible=stage==='archive';
  this.mixer.visible=stage==='tuning';
  this.hatch.visible=['hatch','bunker','breaker','sentinel','choice'].includes(stage);
  this.nora.visible=stage!=='locked'&&stage!=='complete'&&!noraMet;
  this.supplies.visible=stage!=='locked'&&!cacheTaken;
  this.terminal.visible=stage==='bunker';
  this.switchA.visible=stage==='breaker'&&(mask&1)===0;
  this.switchB.visible=stage==='breaker'&&(mask&2)===0;
  this.bunkerExit.visible=stage!=='locked'&&stage!=='complete';
  this.operator.visible=stage==='sentinel';
 }
 setOperator(x:number,z:number,visible:boolean,telegraph:boolean,elapsed:number){
  this.operator.visible=visible;
  if(!visible)return;
  this.operator.position.set(x,Math.sin(elapsed*3)*.04,z);
  (this.eye.material as THREE.MeshBasicMaterial).color.setHex(telegraph?0xffd598:0xbb3c49);
  this.eye.scale.x=telegraph?1.65:1;
 }
}
