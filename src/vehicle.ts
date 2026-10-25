import {buildFirebird1992} from './firebird1992.ts';
import {makeRetroCar,type RetroCar} from './retroCar.ts';
import {addFirebirdDetails14} from './firebirdDetail14.ts';
import {brakeLampIntensity} from './arcadeBrakes.ts';
import * as THREE from 'three';
const paint=new THREE.MeshStandardMaterial({color:0x111318,metalness:.65,roughness:.27,flatShading:true});
const metal=new THREE.MeshStandardMaterial({color:0x9d8565,metalness:.72,roughness:.4});
const gold=new THREE.MeshStandardMaterial({color:0xc49a4d,metalness:.52,roughness:.42});
const rubber=new THREE.MeshStandardMaterial({color:0x141319,roughness:.92});
const leather=new THREE.MeshStandardMaterial({color:0x352528,roughness:.94});
const glass=new THREE.MeshStandardMaterial({color:0x4c6172,metalness:.2,roughness:.19,transparent:true,opacity:.57,side:THREE.DoubleSide});
const glow=new THREE.MeshBasicMaterial({color:0xffd3a2});
const crimson=new THREE.MeshStandardMaterial({color:0x9b2429,emissive:0xa0181b,emissiveIntensity:.9,metalness:.12,roughness:.35});
const dashGlow=new THREE.MeshBasicMaterial({color:0xe4aa73});
function box(g:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material){const q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);q.position.set(x,y,z);q.castShadow=true;q.receiveShadow=true;g.add(q);return q;}
function shape(g:THREE.Group,points:[number,number][],length:number,x:number,y:number,z:number,m:THREE.Material){const s=new THREE.Shape();points.forEach(([a,b],i)=>i?s.lineTo(a,b):s.moveTo(a,b));s.closePath();const geo=new THREE.ExtrudeGeometry(s,{depth:length,bevelEnabled:false});const mesh=new THREE.Mesh(geo,m);mesh.rotation.y=Math.PI/2;mesh.position.set(x,y,z);mesh.castShadow=true;g.add(mesh);return mesh;}
/** Custom low-poly body loft, replacing the rectangular placeholder silhouette. */
function sculptedBody(parent:THREE.Group){
 const stations:[number,number,number,number][]=[
  [-2.44,1.09,.43,.90],[-2.13,1.24,.43,.96],[-1.2,1.25,.45,.94],
  [-.20,1.22,.43,.87],[1.0,1.24,.43,.93],[2.18,1.17,.46,.91],[2.46,1.06,.46,.76]
 ];
 const points:number[]=[],indices:number[]=[];
 stations.forEach(([z,w,low,high])=>{
  points.push(-w,low,z,-w+.08,high,z,w-.08,high,z,w,low,z);
 });
 for(let i=0;i<stations.length-1;i++)for(let k=0;k<4;k++){
  const a=i*4+k,b=i*4+(k+1)%4,c=(i+1)*4+k,d=(i+1)*4+(k+1)%4;
  indices.push(a,c,d,a,d,b);
 }
 indices.push(0,1,2,0,2,3);
 const n=(stations.length-1)*4;indices.push(n,n+3,n+2,n,n+2,n+1);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.setIndex(indices);g.computeVertexNormals();
 const m=new THREE.Mesh(g,paint);m.castShadow=true;m.receiveShadow=true;parent.add(m);
}
export class Firebird {
 readonly group=new THREE.Group(); readonly wheels:THREE.Group[]=[];readonly steeringWheel=new THREE.Group();readonly cockpitAnchor=new THREE.Object3D();
 private retro:RetroCar=makeRetroCar();private roll=0;private detailedModel:THREE.Object3D|null=null;private detailedWheels:THREE.Object3D[]=[];private detailedHeadlights:THREE.SpotLight[]=[];private body=new THREE.Group();private headlamps:THREE.SpotLight[]=[];private gauges:THREE.Group[]=[];private brakeLights:THREE.Mesh[]=[];
 constructor(){this.group.add(this.body,this.retro.group);this.retro.group.visible=false;const c=this.body;
 // Tapered silhouette, sloping windshield and fastback roof (original procedural approximation).
 sculptedBody(c);box(c,2.18,.06,2.2,0,.945,-1.22,paint);
 shape(c,[[-1.16,.82],[-1.12,1.28],[-.86,1.83],[.61,1.83],[1.17,1.08],[1.17,.82]],2.1,-1.05,0,0,paint);
 box(c,2.15,.09,1.45,0,1.84,.2,paint);
 // Windscreen, side windows and rear sloping hatch.
 const windshield=box(c,2.03,.025,.96,0,1.49,-.87,glass);windshield.rotation.x=-.63;
 const back=box(c,2.03,.026,1.19,0,1.49,1.05,glass);back.rotation.x=.60;
 for(const x of [-1,1]){box(c,.035,.47,1.40,x*1.078,1.46,.04,glass);box(c,.24,.17,.34,x*1.24,1.22,-.72,paint);box(c,.04,.12,3.55,x*1.22,.96,0,metal);}
 box(c,2.41,.14,.14,0,.54,-2.45,metal);box(c,2.45,.16,.12,0,.55,2.45,metal);
 // Four wheels oriented to rotate around the axle.
 for(const x of [-1.19,1.19])for(const z of [-1.53,1.56]){const pivot=new THREE.Group();pivot.position.set(x,.48,z);const t=new THREE.Mesh(new THREE.CylinderGeometry(.49,.49,.27,16),rubber);t.rotation.z=Math.PI/2;pivot.add(t);for(const side of [-1,1]){const rim=new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,.012,12),metal);rim.rotation.z=Math.PI/2;rim.position.x=side*.145;pivot.add(rim);const center=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.016,10),gold);center.rotation.z=Math.PI/2;center.position.x=side*.155;pivot.add(center);}c.add(pivot);this.wheels.push(pivot);}
 // Hood bird motif: angular stylized feathers, no licensed texture.
 for(const sign of [-1,1])for(let i=0;i<4;i++){const feather=box(c,.09,.015,.75,sign*(.17+i*.18),.995,-1.47+i*.13,gold);feather.rotation.y=sign*(.24+i*.2);}
 for(const x of [-.84,.84]){box(c,.47,.13,.08,x,.85,-2.44,glow);box(c,.5,.12,.09,x,.80,2.44,new THREE.MeshBasicMaterial({color:0xc22e27}));}
 box(c,1.7,.22,.10,0,.60,-2.49,rubber);box(c,2.35,.12,.32,0,1.09,2.15,paint);
 for(const x of [-.78,.78]){const lamp=new THREE.SpotLight(0xffd8a9,38,31,Math.PI/7,.55,1.1);lamp.position.set(x,.86,-2.32);lamp.target.position.set(x,.32,-18);c.add(lamp,lamp.target);this.headlamps.push(lamp);}
 // Detailed fascia and trim: divided grille, amber indicators and sculpted rear panel.
 const grille=new THREE.MeshStandardMaterial({color:0x222327,metalness:.5,roughness:.65});
 const amber=new THREE.MeshBasicMaterial({color:0xc97d36});
 for(const side of [-1,1]){
  box(c,.82,.19,.045,side*.58,.62,-2.54,grille);
  for(let i=0;i<6;i++)box(c,.045,.14,.06,side*.58-.34+i*.13,.63,-2.58,metal);
  box(c,.19,.095,.065,side*1.09,.67,-2.52,amber);
  box(c,.095,.17,.05,side*1.03,.7,2.51,glow);
  const arch=box(c,.23,.11,.72,side*1.27,.86,-1.53,paint);
  arch.rotation.x=.07;
  box(c,.14,.08,3.8,side*1.2,.47,0,gold);
 }
 for(let i=0;i<5;i++)box(c,.035,.045,.12,-.24+i*.12,.86,-2.52,metal);
 for(const x of [-.53,.53]){box(c,.28,.065,.16,x,.42,2.49,grille);box(c,.15,.08,.12,x,.48,2.55,metal);}
 // Phase 12: layered front fascia, sculpted bonnet scoop, door handles and fine brightwork.
 for(const side of [-1,1]){
  box(c,.9,.11,.08,side*.59,.74,-2.58,rubber);
  box(c,.75,.035,.065,side*.59,.76,-2.62,metal);
  box(c,.08,.16,.09,side*.21,.63,-2.62,metal);
  box(c,.21,.04,.09,side*1.12,1.02,-.43,metal); // chrome door handle
  box(c,.035,.03,2.3,side*1.251,1.02,.31,gold);
  box(c,.11,.22,.11,side*.89,1.05,2.31,crimson);
  const light=box(c,.54,.18,.09,side*.65,.77,2.50,crimson);this.brakeLights.push(light);
  const wheelbase=side*1.19;
  for(const z of [-1.53,1.56]){
   const rivets = new THREE.Group();rivets.position.set(wheelbase+(side*.17),.48,z);
   for(let i=0;i<8;i++){
    const angle=i*Math.PI/4;
    const bolt=new THREE.Mesh(new THREE.SphereGeometry(.034,5,4),gold);
    bolt.position.set(0,Math.sin(angle)*.23,Math.cos(angle)*.23);rivets.add(bolt);
   }
   c.add(rivets);
  }
 }
 const scoop=box(c,.64,.12,.9,0,1.045,-1.16,paint);scoop.rotation.x=-.035;
 box(c,.50,.045,.06,0,1.1,-1.61,rubber);
 for(const side of [-1,1]){
   const stripe=box(c,.035,.012,1.65,side*1.05,1.00,-1.36,gold);stripe.rotation.y=side*.025;
 }
 // Angular thunderbird abstraction made only of original triangles.
 const bird=new THREE.Group();bird.position.set(0,1.019,-1.75);c.add(bird);
 const gild=new THREE.MeshStandardMaterial({color:0xb38a46,metalness:.38,roughness:.53,side:THREE.DoubleSide});
 for(const side of [-1,1])for(let i=0;i<5;i++){
   const x=side*(.12+i*.125),z=i*.06;
   const shape=new THREE.Shape();shape.moveTo(x,-.12+z);shape.lineTo(x+side*(.14+i*.035),-.50+z);shape.lineTo(x+side*.1,.08+z);shape.closePath();
   const feather=new THREE.Mesh(new THREE.ShapeGeometry(shape),gild);feather.rotation.x=-Math.PI/2;bird.add(feather);
 }
 // Functional rear trim, dual exhaust tips and subtle suspension details.
 for(const x of [-.8,.8]){
   const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.095,.095,.46,10),metal);
   pipe.rotation.x=Math.PI/2;pipe.position.set(x,.36,2.64);c.add(pipe);
 }
 // Interior: seats, dashboard and a steering wheel that genuinely follows steering input.
 box(c,2.08,.38,.48,0,1.23,-.81,leather);box(c,1.95,.10,.28,0,1.49,-.67,metal);
 for(const x of [-.53,.53]){box(c,.77,.22,.79,x,1.09,.62,leather);const seat=box(c,.77,.87,.18,x,1.53,.99,leather);seat.rotation.x=-.15;box(c,.43,.22,.20,x,1.94,1.03,leather);}
 box(c,.32,.37,.75,0,1.10,.25,leather);
 // Gauge pods remain in local cockpit coordinates; camera and car share their transform.
 for(const x of [-.72,-.38]){
  const frame=new THREE.Mesh(new THREE.CylinderGeometry(.145,.145,.035,24),metal);
  frame.rotation.x=Math.PI/2;frame.position.set(x,1.39,-.999);c.add(frame);
  const face=new THREE.Mesh(new THREE.CircleGeometry(.126,24),new THREE.MeshBasicMaterial({color:0x171821}));
  face.position.set(x,1.39,-1.025);c.add(face);
  const needle=new THREE.Group();needle.position.set(x,1.39,-1.035);
  box(needle,.018,.105,.012,0,.051,0,dashGlow);
  const center=new THREE.Mesh(new THREE.CircleGeometry(.024,12),gold);center.position.z=.01;needle.add(center);
  needle.rotation.z=2;this.gauges.push(needle);c.add(needle);
  for(let j=0;j<7;j++){
   const a=Math.PI*(.2+j*.43),tick=new THREE.Mesh(new THREE.BoxGeometry(.012,.026,.008),dashGlow);
   tick.position.set(x+Math.sin(a)*.102,1.39+Math.cos(a)*.102,-1.035);
   tick.rotation.z=-a;c.add(tick);
  }
 }
 // Eighties-inspired amber radio and tactile dashboard switches.
 const radio=box(c,.43,.17,.045,.43,1.34,-1.006,rubber);
 box(c,.28,.06,.012,.43,1.355,-1.033,dashGlow);
 for(let i=0;i<3;i++)box(c,.06,.06,.06,.28+i*.14,1.26,-1.019,metal);
 box(c,.38,.16,.12,.5,1.33,-.98,metal);
 this.steeringWheel.position.set(-.56,1.48,-.46);this.steeringWheel.rotation.x=-.33;
 const circle=new THREE.Mesh(new THREE.TorusGeometry(.29,.036,7,20),rubber);this.steeringWheel.add(circle);
 for(let i=0;i<3;i++){const spoke=box(this.steeringWheel,.055,.23,.055,0,.12,0,metal);spoke.rotation.z=i*Math.PI*2/3;spoke.position.set(-Math.sin(spoke.rotation.z)*.11,Math.cos(spoke.rotation.z)*.11,0);}c.add(this.steeringWheel);
 buildFirebird1992(c);
 addFirebirdDetails14(c);
 this.cockpitAnchor.position.set(-.51,1.71,.23);c.add(this.cockpitAnchor);
 }
 /** Lightweight PSX silhouette used at every quality setting. */
 setRetro(enabled:boolean){this.retro.group.visible=enabled;this.body.visible=!enabled&&!this.detailedModel;if(this.detailedModel)this.detailedModel.visible=!enabled;}
 /** Replace the procedural fallback only after a complete GLB has loaded. */
 installDetailedModel(model:THREE.Object3D){
  if(this.detailedModel){this.group.remove(this.detailedModel);}
  this.body.visible=false;this.detailedModel=model;
  this.group.add(model);
  this.detailedWheels=['Wheel_FL','Wheel_FR','Wheel_RL','Wheel_RR'].map(n=>model.getObjectByName(n)).filter((x):x is THREE.Object3D=>Boolean(x));
  for(const x of [-.82,.82]){
   const lamp=new THREE.SpotLight(0xffd4a1,23,28,Math.PI/9,.6,1.0);
   lamp.position.set(x,.83,-2.5);lamp.target.position.set(x,.12,-18);
   this.group.add(lamp,lamp.target);this.detailedHeadlights.push(lamp);
  }
 }
 animate(dt:number,speed:number,steer:number,fuel=44,braking=false){this.roll+=speed*dt/0.49;for(let i=0;i<this.retro.wheels.length;i++){const wheel=this.retro.wheels[i];wheel.rotation.x=this.roll;if(i<2)wheel.rotation.y=steer*.2;}for(let i=0;i<this.wheels.length;i++){this.wheels[i].rotation.x=this.roll;if(i%2===0)this.wheels[i].rotation.y=steer*.24;}this.steeringWheel.rotation.z=steer*.28;this.gauges[0].rotation.z=2-Math.min(1,Math.abs(speed)/23)*4;this.gauges[1].rotation.z=2-Math.min(1,Math.max(0,fuel)/80)*4;for(const lamp of this.brakeLights){(lamp.material as THREE.MeshStandardMaterial).emissiveIntensity=brakeLampIntensity(braking,speed<0);}this.body.rotation.z=THREE.MathUtils.lerp(this.body.rotation.z,-steer*Math.min(Math.abs(speed)/23,1)*.035,Math.min(1,dt*4));
 for(let i=0;i<this.detailedWheels.length;i++){const w=this.detailedWheels[i];w.rotation.x=this.roll;if(i<2)w.rotation.y=steer*.24;}
 if(this.detailedModel)this.detailedModel.rotation.z=this.body.rotation.z;
 }
 setHeadlights(on:boolean){this.retro.headlights.forEach(l=>l.visible=on);this.headlamps.forEach(l=>l.visible=on);this.detailedHeadlights.forEach(l=>l.visible=on);}
}
