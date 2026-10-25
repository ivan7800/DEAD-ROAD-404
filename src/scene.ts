import {AmericanaLighting17} from './lighting17.ts';
import {loadArtAssets, type ArtLoadReport} from './artAssets.ts';
import {ArchitecturalPass} from './architecturalPass.ts';
import {Americana1992} from './americana1992.ts';
import {RoadsideDetail14} from './roadsideDetail14.ts';
import {DriveDust} from './driveDust.ts';
import {batchStaticModel} from './staticBatch.ts';
import * as THREE from 'three';
import type {Mode} from './state.ts';
import {Firebird} from './vehicle.ts';
import {RoadsideArt,createAsphalt,createPlaster,createRust} from './artDirection.ts';
import {GRAPHICS,renderPixelRatio,type GraphicsPreset} from './quality.ts';
import type {MissionStage} from './mission.ts';
const mat=(c:number,roughness=1)=>new THREE.MeshStandardMaterial({color:c,roughness,flatShading:true});
const asphalt=createAsphalt(),sand=mat(0x51404a),wall=createPlaster(),rust=createRust(),gold=mat(0xc2a169),black=mat(0x100f17,.45),glass=new THREE.MeshStandardMaterial({color:0x342d42,metalness:.25,roughness:.2,transparent:true,opacity:.85});
function block(parent:THREE.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function cylinder(parent:THREE.Object3D,r:number,h:number,x:number,y:number,z:number,m:THREE.Material,seg=9){let o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;}
export class GameWorld {
 readonly scene=new THREE.Scene();readonly lighting17=new AmericanaLighting17();readonly stationFallback=new THREE.Group();readonly motelFallback=new THREE.Group();
 artStatus:'cargando'|'glb'|'parcial'|'reserva'='cargando';artReport:ArtLoadReport|null=null;readonly camera=new THREE.PerspectiveCamera(73,1,.07,200);readonly renderer:THREE.WebGLRenderer;
 readonly architecturalPass=new ArchitecturalPass();readonly americana1992=new Americana1992();readonly roadsideDetail14=new RoadsideDetail14(); readonly driveDust:DriveDust;readonly firebird=new Firebird();readonly car=this.firebird.group; readonly roadsideArt=new RoadsideArt(); readonly player=new THREE.Vector3(0,1.7,7); readonly can=new THREE.Vector3(11,0,1);
 readonly sceneryBatch:{before:number;after:number;merged:number};private graphicsPreset:GraphicsPreset='equilibrado';private moonLight:THREE.DirectionalLight; private flashlight:THREE.SpotLight; private flashlightTarget:THREE.Object3D; private neon:THREE.PointLight|null=null; private sky:THREE.Color; private lastAtmosphereTime=0; private enemyHead:THREE.Mesh|null=null; private dangerLight=new THREE.PointLight(0xec1e33,0,7); private hitLight=new THREE.PointLight(0xffb968,0,6); readonly enemyVisual=new THREE.Group(); private enemyArms:THREE.Group[]=[];private enemyLegs:THREE.Group[]=[]; private enemyEyes:THREE.Mesh[]=[]; private missionKey=new THREE.Group(); private vera=new THREE.Group(); private motelTapeVisual=new THREE.Group();
 constructor(canvas:HTMLCanvasElement){
  this.renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});this.renderer.setPixelRatio(1);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;
  this.sky=new THREE.Color(0x10121c);this.scene.background=this.sky;this.scene.fog=new THREE.FogExp2(0x423340,.019);
  this.scene.add(new THREE.HemisphereLight(0x887baa,0x4c2824,1.5));const moon=new THREE.DirectionalLight(0x9e9fc9,1.9);moon.position.set(-15,24,-18);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);moon.shadow.camera.left=-65;moon.shadow.camera.right=65;moon.shadow.camera.top=65;moon.shadow.camera.bottom=-65;this.scene.add(moon);this.moonLight=moon;
  this.scene.add(this.dangerLight,this.hitLight,this.lighting17.group);
  this.flashlight = new THREE.SpotLight(0xffedcf,45,26,Math.PI/7,.65,1.2);
  this.flashlightTarget = new THREE.Object3D();
  this.flashlight.target = this.flashlightTarget;
  this.flashlight.visible=false;
  this.scene.add(this.flashlight,this.flashlightTarget);
  this.scene.add(this.stationFallback,this.motelFallback);this.buildLandscape();this.buildDistantHorizon();this.buildRoadDressing();this.buildStation();this.buildStationInterior();this.buildAtmosphere();this.buildNeonSet();this.buildEnemy();this.buildStoryProps();this.scene.add(this.architecturalPass.group);this.scene.add(this.roadsideArt.group);this.scene.add(this.americana1992.group);this.scene.add(this.roadsideDetail14.group);this.scene.add(this.car);this.driveDust=new DriveDust(this.scene);this.car.position.set(0,.18,19);
  // Batch only directly-owned noninteractive scenery; game actors live in groups.
  this.sceneryBatch=batchStaticModel(this.scene,{directOnly:true,cellSize:30});
  this.resize();window.addEventListener('resize',()=>this.resize());
  void this.initArtAssets();
 }
 async initArtAssets(){
  const report=await loadArtAssets(this.scene,this.firebird,{station:this.stationFallback,motel:this.motelFallback});
  this.artReport=report;
  if(report.station&&report.motel){this.architecturalPass.group.visible=false;
   const oldSigns=this.americana1992.group.getObjectByName('LegacySignage');if(oldSigns)oldSigns.visible=false;}
  this.artStatus=report.ok===3?'glb':report.ok>0?'parcial':'reserva';
  document.dispatchEvent(new CustomEvent('deadroad:art-loaded',{detail:report}));
 }
 setGraphics(preset:GraphicsPreset){this.graphicsPreset=preset;this.lighting17.setGraphics(preset);const settings=GRAPHICS[preset];this.driveDust.setPreset(preset);this.renderer.shadowMap.enabled=settings.shadows;this.moonLight.castShadow=settings.shadows;this.moonLight.shadow.mapSize.set(settings.shadowSize,settings.shadowSize);this.moonLight.shadow.map?.dispose();this.moonLight.shadow.map=null;this.renderer.shadowMap.needsUpdate=true;this.renderer.toneMappingExposure=settings.exposure;this.resize();}
 resize(){const w=this.renderer.domElement.clientWidth||innerWidth,h=this.renderer.domElement.clientHeight||innerHeight;this.renderer.setPixelRatio(renderPixelRatio(this.graphicsPreset,window.devicePixelRatio||1,w,h));this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 private buildLandscape(){block(this.scene,250,.15,250,0,-.15,0,sand);block(this.scene,9,.03,230,0,-.04,-15,asphalt);for(let z=-113;z<104;z+=9){block(this.scene,.15,.01,3,0,-.018,z,mat(0xbda27f));}for(let z=-110;z<105;z+=12){for(const side of [-1,1]){const x=side*(15+(Math.sin(z*4.2)+1)*8);const s=1+Math.abs(Math.sin(z*.42))*3;const stone=new THREE.Mesh(new THREE.DodecahedronGeometry(s,0),mat(0x42353e));stone.position.set(x,s*.25,z);stone.scale.set(1,.38,1.1);this.scene.add(stone);}}for(let i=0;i<15;i++){let z=-108+i*14;let x=i%2===0?-31:33;let cactus=mat(0x374737);cylinder(this.scene,.3,3.3,x,1.3,z,cactus,6);block(this.scene,.26,1.7,.26,x+.8,1.2,z,cactus);block(this.scene,.8,.25,.25,x+.5,1.55,z,cactus);} }
 private buildDistantHorizon(){
  // Massive rock silhouettes, low-poly with carefully limited draw calls.
  const layers=[{x:-54,z:-63,r:17,h:18},{x:53,z:-76,r:24,h:23},{x:-68,z:28,r:27,h:32},{x:62,z:31,r:18,h:19},{x:-44,z:-111,r:15,h:19}];
  for(const [i,m] of layers.entries()){
   const rock=new THREE.Mesh(new THREE.CylinderGeometry(m.r*.58,m.r,m.h,7,2),mat(i%2?0x40303a:0x352b35));
   rock.position.set(m.x,m.h*.45-1,m.z);rock.rotation.y=i*.55;rock.receiveShadow=true;this.scene.add(rock);
   const seam=new THREE.Mesh(new THREE.CylinderGeometry(m.r*.59,m.r*.72,m.h*.09,7),mat(0x67505a));
   seam.position.set(m.x,m.h*.79,m.z);this.scene.add(seam);
  }
  const moon=new THREE.Mesh(new THREE.SphereGeometry(6,18,12),new THREE.MeshBasicMaterial({color:0xe0b9a2,fog:false}));
  moon.position.set(-64,69,-106);this.scene.add(moon);
 }
 private buildRoadDressing(){
  const stripe=mat(0xd1a56c),reflector=new THREE.MeshBasicMaterial({color:0xf6bd7b}),dead=mat(0x29232d),wire=mat(0x473941);
  // Deterministic prop placement: no global RNG, so the layout does not jump between saves.
  for(let i=0;i<26;i++){
   const z=-110+i*8;
   for(const sign of [-1,1]){
    block(this.scene,.11,.06,2.2,sign*4.22,.012,z,stripe);
    if(i%3===0){cylinder(this.scene,.055,1.1,sign*5.4,.55,z,wire,6);block(this.scene,.18,.09,.13,sign*5.4,1.06,z,reflector);}
   }
  }
  for(let i=0;i<11;i++){
   const z=-93+i*15, x=(i%2?-13:12)+(i%4);
   // Dead skeletal trees and silhouette-breaking antenna poles.
   cylinder(this.scene,.11,2.1,x,1.05,z,dead,5);
   const branch=block(this.scene,.08,1.5,.08,x+.43,2.08,z,dead);branch.rotation.z=.55;
   const branch2=block(this.scene,.07,1,.07,x-.31,1.85,z,dead);branch2.rotation.z=-.6;
  }
 }
 private buildStation(){// Gas station footprint, clear gameplay corridor on right
  block(this.stationFallback,16,.2,14,15,.04,-4,mat(0x40313a));block(this.stationFallback,14,5,.8,15,2.5,-11,wall);block(this.stationFallback,.7,5,12,8,2.5,-5,wall);block(this.stationFallback,.7,5,12,22,2.5,-5,wall);block(this.stationFallback,14,.6,12,15,5.15,-5,rust);block(this.stationFallback,14,1,.4,15,4.4,1,rust);
  block(this.stationFallback,3,2,.15,11.2,2.3,1.25,glass);block(this.stationFallback,3,2,.15,18.6,2.3,1.25,glass);// Entrée centrale abierta; marco físico visible y corredor libre
  block(this.stationFallback,.19,3.2,.24,13.65,1.62,1.25,rust);block(this.stationFallback,.19,3.2,.24,16.35,1.62,1.25,rust);block(this.stationFallback,2.9,.22,.3,15,3.2,1.25,gold);
  block(this.stationFallback,5.2,1.4,.18,10.95,3.8,1.25,wall);block(this.stationFallback,5.2,1.4,.18,19.05,3.8,1.25,wall);
  // canopy beside the station and two petrol pumps
  block(this.stationFallback,16,.48,6,15,4.4,6.5,rust);for(const x of [9,21])for(const z of [4,9])cylinder(this.stationFallback,.18,4,x,2.1,z,black);
  for(const x of [12,18]){block(this.stationFallback,1.3,1.9,1.1,x,1,6.3,rust);block(this.stationFallback,.9,.65,.1,x,1.45,6.88,glass);block(this.stationFallback,.7,.15,.12,x,.75,6.9,black);}
  // canister pickup on the east side
  block(this.stationFallback,.8,1,.52,11,.55,1,mat(0xb58c52));block(this.stationFallback,.47,.12,.25,11,1.15,1,black);
  // radio tower sign
  cylinder(this.stationFallback,.16,9,6,4.5,-8,rust);block(this.stationFallback,5,2,.3,6,8,-8,mat(0x3b2937));block(this.stationFallback,4.5,.13,.45,6,7.6,-7.8,gold);
  const lamp=new THREE.PointLight(0xff6548,55,19,2);lamp.position.set(15,3.8,3);this.scene.add(lamp);this.neon=lamp;const glow=new THREE.PointLight(0xffd59c,25,10,2);glow.position.set(12,2.8,6);this.scene.add(glow);
 }
 private buildNeonSet(){
  // Authentic geometry lights: atmospheric light pools, not screenshots or copied textures.
  const cyan=new THREE.MeshBasicMaterial({color:0x58c2c8}),amber=new THREE.MeshBasicMaterial({color:0xffb067}),red=new THREE.MeshBasicMaterial({color:0xfa4256});
  for(let i=0;i<3;i++){
   block(this.scene,3.3,.055,.1,12.6+i*.9,4.7,1.56,i===1?red:amber);
  }
  for(const [x,z] of [[9,6.6],[21,6.6]]){
   const l=new THREE.PointLight(0x8cc7f5,10,9,2);l.position.set(x,4,z);this.scene.add(l);
   block(this.scene,1.1,.05,.28,x,4.08,z,cyan);
  }
  const motelLamp=new THREE.PointLight(0xf5456a,22,19,2);
  motelLamp.position.set(-19,3.3,-41);this.scene.add(motelLamp);
  const beacon=new THREE.Mesh(new THREE.SphereGeometry(.45,10,7),red);
  beacon.position.set(-19,4.5,-40);this.scene.add(beacon);
 }
 private buildAtmosphere(){
  // Procedural night sky, abandoned signage and wrecks. No external asset dependencies.
  const starPositions:number[]=[];
  for(let i=0;i<500;i++){const a=i*2.39996;const y=12+(i*17%83);const radius=80+(i*13%90);starPositions.push(Math.cos(a)*radius,y,Math.sin(a)*radius);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));
  this.scene.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xb3a5c6,size:.5,sizeAttenuation:true,depthWrite:false})));
  const sign=mat(0xb26a4f),letters=mat(0xe9bf81),post=mat(0x3a3036);
  block(this.scene,.24,5,.24,-7,2.5,-19,post);block(this.scene,4.8,2.5,.28,-7,5.2,-19,sign);
  for(let i=0;i<4;i++)block(this.scene,.6,.13,.33,-8.5+i,5.4,-18.75,letters);
  // Roadside debris and motel facade create stronger visual silhouettes.
  for(let i=0;i<7;i++){let z=-32-i*19;let x=i%2?9:-11;block(this.scene,2.4,.2,.7,x,.06,z,mat(0x493c39));block(this.scene,.1,1.5,.1,x+1.1,.9,z,post);}
  // Explorable motel room with an open entrance and readable interior landmarks.
  const motelWall=mat(0x41323d),motelRoof=mat(0x69414d),motelFloor=mat(0x554640);
  block(this.motelFallback,8,.2,8,-20,.02,-45,motelFloor);
  block(this.motelFallback,.5,3,8,-24,1.5,-45,motelWall);block(this.motelFallback,.5,3,8,-16,1.5,-45,motelWall);
  block(this.motelFallback,8,3,.5,-20,1.5,-49,motelWall);
  block(this.motelFallback,2.6,3,.35,-22.7,1.5,-41,motelWall);block(this.motelFallback,2.6,3,.35,-17.3,1.5,-41,motelWall);
  block(this.motelFallback,8,.45,8,-20,3.3,-45,motelRoof);
  // Interior: beds, worn carpet, luggage, bedside lamp and a tape recorder.
  block(this.motelFallback,2.5,.45,2.5,-22,0.5,-46.5,mat(0x362b38));
  block(this.motelFallback,2.4,.18,1,-22,.84,-47.1,mat(0x958071));
  block(this.motelFallback,1.6,.65,1.8,-17.6,.42,-46,mat(0x4c3037));
  block(this.motelFallback,2.7,.025,3.8,-20,.14,-45,mat(0x6d4745));
  block(this.motelFallback,.9,1,.6,-21,0.5,-48,mat(0x443d3f));
  const lamp=new THREE.PointLight(0xf4a36c,15,10,2);lamp.position.set(-20.5,2.4,-46);this.scene.add(lamp);
  block(this.motelFallback,1.7,.5,.15,-20,3.65,-40.7,mat(0xd18b65));
  const red=new THREE.PointLight(0xde344a,20,15,2);red.position.set(-19,3,-40);this.scene.add(red);
 }
 setFlashlight(active:boolean,yaw:number,pitch:number){
  this.flashlight.visible=active;
  if(!active)return;
  const dir=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));
  this.flashlight.position.copy(this.player);
  this.flashlightTarget.position.copy(this.player).addScaledVector(dir,9);
 }
 flashDanger(){this.dangerLight.position.copy(this.player);this.dangerLight.intensity=15;}
 flashHit(hit:boolean){if(hit){this.hitLight.position.copy(this.player);this.hitLight.intensity=10;}}
 setAtmosphere(time:number){const dt=this.lastAtmosphereTime>0?Math.max(0,Math.min(.15,time-this.lastAtmosphereTime)):.016;this.lastAtmosphereTime=time;this.roadsideArt.animate(time,true);this.lighting17.animate(time,window.matchMedia('(prefers-reduced-motion: reduce)').matches);this.americana1992.setTime(time,window.matchMedia('(prefers-reduced-motion: reduce)').matches);this.dangerLight.intensity*=Math.exp(-10*dt);this.hitLight.intensity*=Math.exp(-11*dt);if(this.neon)this.neon.intensity=window.matchMedia('(prefers-reduced-motion: reduce)').matches?45:42+Math.sin(time*3.8)*12+Math.sin(time*11)*6;}
 private buildStationInterior(){
  // Front opening leads into an explorable store, with wall collision controlled in worldCollision.ts.
  const shelf=mat(0x493b3b),packet=mat(0xb2916c),cold=mat(0x49717c),red=mat(0x8c3e3c);
  for(const x of [10,20])for(const z of [-8,-5]){block(this.stationFallback,2.7,2.4,.48,x,1.25,z,shelf);for(let h=0;h<3;h++){block(this.stationFallback,2.6,.09,.67,x,.52+h*.73,z,packet);for(let i=0;i<4;i++)block(this.stationFallback,.32,.38,.26,x-1.02+i*.64,.78+h*.73,z, i%2?red:cold);}}
  block(this.stationFallback,4.1,1.13,1.2,15,.62,-2.4,shelf);block(this.stationFallback,4.3,.12,1.4,15,1.22,-2.4,packet);
  for(let i=0;i<3;i++){block(this.stationFallback,1.2,2.6,1.0,18+i*.95,1.37,-8.9,cold);block(this.stationFallback,.86,1.8,.03,18+i*.95,1.43,-8.37,glass);}
  for(const x of [9.3,20.7]){const l=new THREE.PointLight(0xf6a85e,12,8,2);l.position.set(x,3,-4);this.scene.add(l);}
  // Raised lettering is actual geometry, not an image overlay.
  for(let i=0;i<7;i++)block(this.stationFallback,.38,.36,.1,12+i*.52,4.72,1.31,mat(i%2?0xdb664f:0xf3c18d));
  block(this.stationFallback,.42,.27,.35,14.4,1.55,-2.38,black); // story radio, approached with R
  for(let i=0;i<10;i++){let z=2.2+i*.43;block(this.stationFallback,.12,.02,.19,8.1,.13,z,rust);}
 }
 private buildStoryProps(){
  const skin=mat(0xa58b74),jacket=mat(0x88613f),boots=mat(0x26212b),marker=mat(0xe3bd6e);
  // Vera stands at the motel entrance: distinct silhouette and readable location.
  cylinder(this.vera,.37,1.25,0,1.17,0,jacket,7);
  cylinder(this.vera,.25,.45,0,2.03,0,skin,8);
  for(const x of [-.19,.19])block(this.vera,.23,.8,.3,x,.46,0,boots);
  block(this.vera,.2,.74,.24,-.52,1.36,0,jacket);block(this.vera,.2,.74,.24,.52,1.36,0,jacket);
  const hair=block(this.vera,.56,.2,.56,0,2.35,0,boots);hair.rotation.z=.12;
  this.vera.position.set(-20,0,-40.5);this.scene.add(this.vera);
  const halo=new THREE.PointLight(0xffaa76,12,7);halo.position.set(-20,2.65,-40.5);this.scene.add(halo);
  const metal=new THREE.MeshStandardMaterial({color:0xc7ac65,metalness:.65,roughness:.3});
  block(this.missionKey,.65,.1,.18,0,0,0,metal);cylinder(this.missionKey,.18,.07,-.36,0,0,metal);
  this.missionKey.position.set(17.2,1.4,-8.4);this.scene.add(this.missionKey);
  const tapeBody=mat(0x252432),tapeLabel=mat(0xcfb37e);
  block(this.motelTapeVisual,.64,.13,.38,0,0,0,tapeBody);block(this.motelTapeVisual,.43,.012,.21,0,.07,0,tapeLabel);
  for(const x of [-.16,.16])cylinder(this.motelTapeVisual,.068,.015,x,.085,0,tapeBody,12);
  this.motelTapeVisual.position.set(-20,.85,-45);this.scene.add(this.motelTapeVisual);
  block(this.scene,2.4,1.3,.4,-20,3.55,-41.15,marker);
  // Significant roadside dressing; no downloaded models or copied textures.
  for(let i=0;i<18;i++) {const z=-100+i*9.7,x=i%2===0?7.5:-8.5;
    block(this.scene,.07,1.05,.07,x,.58,z,rust);
    if(i%3===0)block(this.scene,.85,.5,.09,x,1.25,z,mat(0xa77b58));
  }
  // Aparcamiento: marcas gastadas, barriles, neumáticos y postes de protección.
  const stripe=mat(0xc0a17d),barrel=mat(0x815044),rubber=mat(0x171820);
  for(let i=0;i<5;i++)block(this.scene,.1,.025,2.6,24+i*1.8,.015,11.5,stripe);
  for(const [x,z] of [[24,4],[25,5],[24,7],[27,-1]]){
   cylinder(this.scene,.4,.85,x,.43,z,barrel,10);
   cylinder(this.scene,.42,.08,x,.24,z,black,10);
  }
  for(const [x,z] of [[8.8,3],[21.2,3],[8.8,9],[21.2,9]]){
   cylinder(this.scene,.16,1,x,.5,z,gold,8);
  }
  for(const [x,z] of [[-13,-40],[-27,-42],[28,-19]]){
   const tire=cylinder(this.scene,.64,.25,x,.4,z,rubber,12);tire.rotation.z=Math.PI/2;
   cylinder(this.scene,.28,.27,x,.4,z,mat(0x777277),12).rotation.z=Math.PI/2;
  }
  for(let i=0;i<14;i++){const x=8.7+(i%5)*2.9,z=11.5+Math.floor(i/5)*2.5;
    const crate=block(this.scene,.55,.4,.7,x,.26,z,mat(i%3===0?0x756047:0x4b4641));crate.rotation.y=i*.6;
  }
 }
 setTapeVisible(visible:boolean){this.motelTapeVisual.visible=visible;}
 setMissionStage(stage:MissionStage){this.missionKey.visible=stage==='signal';this.vera.visible=stage==='key'||stage==='resolved';}
 private buildEnemy(){
  const body=mat(0x494453),head=mat(0x9a8e80),eyes=new THREE.MeshBasicMaterial({color:0xf26452});
  cylinder(this.enemyVisual,.45,1.3,0,1.05,0,body,7);
  const skull=new THREE.Mesh(new THREE.IcosahedronGeometry(.36,0),head);skull.position.y=1.95;this.enemyVisual.add(skull);this.enemyHead=skull;
  for(const x of [-.16,.16]){const eye=new THREE.Mesh(new THREE.BoxGeometry(.09,.055,.06),eyes);eye.position.set(x,2,.34);this.enemyVisual.add(eye);this.enemyEyes.push(eye);}
  for(const x of [-.24,.24]){
   const arm=new THREE.Group();arm.position.set(x*2,1.67,0);
   block(arm,.2,.92,.23,0,-.46,0,body);this.enemyVisual.add(arm);this.enemyArms.push(arm);
   const leg=new THREE.Group();leg.position.set(x*1.25,.56,0);
   block(leg,.24,.9,.3,0,-.36,0,body);this.enemyVisual.add(leg);this.enemyLegs.push(leg);
  }
  this.enemyVisual.position.set(17,0,-6);this.scene.add(this.enemyVisual);
 }
 setEnemy(x:number,z:number,alive:boolean,time:number,locomotion=0){
  this.enemyVisual.visible=alive;
  if(!alive)return;
  this.enemyVisual.position.set(x,Math.sin(time*5)*.055*locomotion,z);
  this.enemyVisual.rotation.y=Math.sin(time*.45)*.09+Math.sin(time*1.1)*.06;
  if(this.enemyHead)this.enemyHead.rotation.z=Math.sin(time*1.7)*.05;
  const stride=Math.sin(time*5.5)*.38*locomotion;
  this.enemyArms.forEach((a,i)=>{a.rotation.x=(i===0?stride:-stride)*.85;a.rotation.z=i===0?.17:-.17;});
  this.enemyLegs.forEach((leg,i)=>{leg.rotation.x=i===0?-stride:stride;});
  this.enemyEyes.forEach((e,i)=>{(e.material as THREE.MeshBasicMaterial).color.setHex((Math.sin(time*6+i*.3)>-.25)?0xff5544:0xa61b22);});
 }
 updateIdleEffects(dt:number){this.driveDust.update(dt,this.car,0,0,false);}
 updateCarVisual(dt:number,speed:number,steer=0,fuel=44,braking=false){this.firebird.animate(dt,speed,steer,fuel,braking);this.driveDust.update(dt,this.car,speed,steer,true);}
 setMode(mode:Mode,carX:number,carZ:number,yaw:number){this.car.visible=mode!=='explore';this.car.position.set(carX,.18,carZ);this.car.rotation.y=yaw;}
 render(){this.renderer.render(this.scene,this.camera);}
 dispose(){this.driveDust.dispose();this.renderer.dispose();}
}
