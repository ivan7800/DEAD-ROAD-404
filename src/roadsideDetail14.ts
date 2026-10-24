import * as THREE from 'three';
/** Stage dressing for 1992: original roadside assets, away from navigation and interactable areas. */
const wood=new THREE.MeshStandardMaterial({color:0x55433e,roughness:1});
const corroded=new THREE.MeshStandardMaterial({color:0x5c4e4a,metalness:.35,roughness:.87});
const asphalt=new THREE.MeshStandardMaterial({color:0x24232a,roughness:1});
const faded=new THREE.MeshStandardMaterial({color:0x9c8172,roughness:.96});
const light=new THREE.MeshBasicMaterial({color:0xe4b47f});
function box(g:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o;}
function sign(lines:string[]):THREE.Texture {
 const c=document.createElement('canvas');c.width=512;c.height=256;const p=c.getContext('2d');if(!p)throw new Error('Canvas 2D no disponible');
 p.fillStyle='#302b37';p.fillRect(0,0,512,256);p.strokeStyle='#d9954a';p.lineWidth=12;p.strokeRect(12,12,488,232);
 p.fillStyle='#e3d0aa';p.textAlign='center';p.textBaseline='middle';
 for(let i=0;i<lines.length;i++){p.font=i===0?'bold 58px Impact, sans-serif':'bold 36px monospace';p.fillText(lines[i],256,lines.length===1?128:84+i*90,455);}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;return t;
}
export class RoadsideDetail14 {
 readonly group=new THREE.Group();
 constructor(){const g=this.group;
  // Ghost drive-in beyond the right shoulder. Never blocks the route to Sunspur, Vera or the motel.
  const driveIn=new THREE.Group();driveIn.position.set(39,0,-31);g.add(driveIn);
  for(const x of [-5.1,5.1])box(driveIn,.22,6.6,.25,x,3.3,0,wood);
  box(driveIn,11.1,5.2,.28,0,6.0,0,corroded);
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(10.45,4.6),new THREE.MeshBasicMaterial({map:sign(['LAST PICTURE SHOW','THE END IS A ROAD']),side:THREE.DoubleSide}));screen.position.set(0,6,.2);driveIn.add(screen);
  // Eight power poles as THREE instancing: three draw calls rather than 32 meshes.
  const dummy=new THREE.Object3D();
  const poleSets:[number,number,number,THREE.Material,number][]=[
   [.2,8,.2,wood,8],[3,.19,.21,corroded,8],[.17,.34,.18,light,16]
  ];
  for(const [w,h,d,material,count] of poleSets){
   const inst=new THREE.InstancedMesh(new THREE.BoxGeometry(w,h,d),material,count);
   inst.castShadow=material!==light;
   for(let i=0;i<count;i++){
    const poleIndex=material===light?Math.floor(i/2):i;
    const z=-98+poleIndex*23;
    const x=material===light?-12+(i%2===0?-1.08:1.08):-12;
    const y=material===wood?4:material===corroded?7.45:7.6;
    dummy.position.set(x,y,z);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);
   }
   inst.instanceMatrix.needsUpdate=true;g.add(inst);
  }
  const cableGeometry=new THREE.BufferGeometry();const cableSegments:number[]=[];
  for(let i=0;i<7;i++)for(let j=0;j<12;j++){
   const z=-98+i*23;
   for(const t of [j/12,(j+1)/12])cableSegments.push(-13.05,7.4-.65*Math.sin(t*Math.PI),z+t*23);
  }
  cableGeometry.setAttribute('position',new THREE.Float32BufferAttribute(cableSegments,3));
  g.add(new THREE.LineSegments(cableGeometry,new THREE.LineBasicMaterial({color:0x292631})));
  // Forecourt clues: tattered bin, discarded VHS cases, a collapsed vending sign.
  box(g,.85,.91,.82,28,.48,8.8,corroded);
  for(let i=0;i<4;i++){const cassette=box(g,.35,.07,.27,26+i*.38,.18,10.5+i*.18,i%2?faded:asphalt);cassette.rotation.y=i*.41;}
  box(g,1.55,.20,.13,29,.44,12.7,wood);
  // Station backlot, several wireframe-looking rusted containers; outside existing gameplay footprints.
  for(let i=0;i<4;i++){
   const x=27.3+i*1.75,z=-10.7;
   box(g,1.53,1.47,1.1,x,.77,z,corroded);
   for(let j=0;j<3;j++)box(g,1.53,.035,.07,x,.33+j*.45,z+.57,faded);
  }
 }
}
