import * as THREE from 'three';
import type {RoadEventId} from './roadEvents.ts';
/** Props de eventos de carretera. Geometría low-poly y materiales Standard que `applyPSXMaterials`
 * cuantiza como el resto del escenario (sin texturas nuevas, sin sombras, sin efectos extra). */
const std=(color:number)=>new THREE.MeshStandardMaterial({color,roughness:1});
const mats={dark:std(0x1c1a22),rust:std(0x5c4e4a),cloth:std(0x3b4a3a),skin:std(0x8c6f5f),green:std(0x1f5a3a),white:std(0xcfc7b0),blood:std(0x4a1418),wood:std(0x55433e)};
const glow=new THREE.MeshBasicMaterial({color:0xf0d89a});
function box(g:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o;}
function build(id:RoadEventId):THREE.Group {
 const g=new THREE.Group();
 switch(id){
  case 'hitchhiker':box(g,.7,1.2,.4,0,1.2,0,mats.cloth);box(g,.4,.4,.4,0,2.0,0,mats.skin);box(g,.55,.8,.3,0,1.3,-.35,mats.rust);box(g,.14,.7,.14,.5,1.9,0,mats.cloth);box(g,.2,.2,.2,.5,2.35,0,mats.skin);box(g,.5,.7,.3,0,.35,0,mats.dark);break;
  case 'abandoned-car':box(g,2.1,.7,4.2,0,.7,0,mats.rust);box(g,1.8,.6,2.1,0,1.3,-.2,mats.dark);box(g,.12,.6,1.4,-1.05,.9,.8,mats.rust).rotation.y=.9;box(g,.4,.2,.1,-.6,.8,2.12,glow);box(g,.4,.2,.1,.6,.8,2.12,glow);break;
  case 'roadkill':{const b=box(g,2,.7,1.1,0,.4,0,mats.blood);b.rotation.y=.4;box(g,.5,.5,.5,1.2,.6,.3,mats.skin);for(const x of [-.6,.1,.8])box(g,.15,.7,.15,x,.2,.7,mats.dark);break;}
  case 'shoulder-figure':box(g,.55,2.5,.35,0,1.8,0,mats.dark);box(g,.35,.4,.35,0,3.25,0,mats.skin);box(g,.12,1.5,.12,-.45,1.9,0,mats.dark);box(g,.12,1.5,.12,.45,1.9,0,mats.dark);break;
  case 'wrong-sign':box(g,.2,3.8,.2,-1.6,1.9,0,mats.wood);box(g,.2,3.8,.2,1.6,1.9,0,mats.wood);box(g,3.8,1.9,.18,0,3.6,0,mats.green);box(g,3.4,.3,.2,0,3.95,.02,mats.white);box(g,2.6,.25,.2,0,3.3,.02,mats.white);box(g,.9,.3,.2,1.1,3.0,.02,mats.white);box(g,.45,.2,.2,-1.05,2.7,.02,mats.white);break;
  case 'headlights':box(g,2,.9,.3,0,.9,0,mats.dark);box(g,1.7,.35,.25,0,1.25,-.2,mats.dark);box(g,.45,.3,.3,-.6,.9,.2,glow);box(g,.45,.3,.3,.6,.9,.2,glow);break;
 }
 return g;
}
export class RoadEventProps {
 readonly group=new THREE.Group();
 private readonly props=new Map<RoadEventId,THREE.Group>();
 private active:RoadEventId|null=null;
 constructor(){
  for(const id of ['hitchhiker','abandoned-car','roadkill','shoulder-figure','wrong-sign','headlights'] as RoadEventId[]){
   const p=build(id);p.visible=false;this.props.set(id,p);this.group.add(p);
  }
 }
 /** Sitúa el prop del evento a `z` en el arcén (o en el carril detrás del coche para los faros). */
 show(id:RoadEventId|null,z:number){
  this.active=id;
  for(const [k,p] of this.props){
   p.visible=k===id;
   if(k!==id)continue;
   if(k==='roadkill')p.position.set(0,0,z);
   else if(k==='headlights'){p.position.set(0,0,z+16);p.rotation.y=0;}
   else if(k==='abandoned-car'){p.position.set(6.4,0,z);p.rotation.y=.35;}
   else{p.position.set(k==='wrong-sign'?6.4:-6,0,z);p.rotation.y=k==='shoulder-figure'?Math.PI/2:0;}
  }
 }
 animate(time:number){
  if(!this.active)return;
  const prop=this.props.get(this.active);if(!prop||!prop.visible)return;
  if(this.active==='headlights'){
   prop.position.z+=Math.sin(time*6)*0.015;
   prop.scale.setScalar(1+Math.sin(time*8)*0.02);
  }else if(this.active==='shoulder-figure'){
   prop.rotation.z=Math.sin(time*2.2)*0.05;
  }
 }
}
