import * as THREE from 'three';
/** Original, modeled retro car details, designed to enrich rather than replace the working chassis. */
const chrome=new THREE.MeshStandardMaterial({color:0xad9e87,metalness:.82,roughness:.3});
const gold=new THREE.MeshStandardMaterial({color:0xd6aa5b,metalness:.54,roughness:.36});
const matte=new THREE.MeshStandardMaterial({color:0x10141a,roughness:.93});
const amber=new THREE.MeshBasicMaterial({color:0xe5a56b});
const burgundy=new THREE.MeshStandardMaterial({color:0x543337,roughness:.89});
function cube(g:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;g.add(mesh);return mesh;
}
function panelTexture():THREE.Texture {
 const c=document.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d');
 if(!ctx)throw new Error('Canvas 2D no disponible');
 ctx.fillStyle='#151922';ctx.fillRect(0,0,256,128);
 ctx.strokeStyle='#ba9059';ctx.lineWidth=7;ctx.strokeRect(7,7,242,114);
 ctx.fillStyle='#e8c58a';ctx.font='bold 52px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('404',128,64);
 ctx.font='bold 11px monospace';ctx.fillText('NIGHT COUNTY · 1992',128,105);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;return t;
}
export function addFirebirdDetails14(body:THREE.Group){
 const g=new THREE.Group();g.name='firebird-original-detail-1992';body.add(g);
 // Sculpted lip below nose, pop-up headlight housings and hood vents.
 const lip=cube(g,2.23,.075,.31,0,.48,-2.54,matte);lip.rotation.x=.08;
 for(const s of [-1,1]){
  cube(g,.94,.036,1.52,s*.62,1.005,-1.57,gold); // double hood pinstripe
  cube(g,.5,.075,.58,s*.72,1.05,-2.09,matte);
  for(let i=0;i<4;i++)cube(g,.4,.012,.035,s*.72,1.094,-2.25+i*.13,chrome);
  cube(g,.08,.22,.92,s*1.22,.9,1.5,chrome);
  cube(g,.14,.11,.29,s*1.25,1.16,.46,matte);
  // wheel arch reveals lower silhouette on both axles
  for(const z of [-1.53,1.56]){
   const arch=new THREE.Mesh(new THREE.TorusGeometry(.56,.045,5,18,Math.PI),gold);
   arch.position.set(s*1.28,.53,z);arch.rotation.set(0,s*Math.PI/2,0);g.add(arch);
  }
  // twin vertical tail-lamp segments with a distinctive 1970s outline
  for(let j=0;j<3;j++)cube(g,.16,.14,.05,s*(.43+j*.20),.82,2.563,amber);
 }
 // Windshield sealing rubber and restrained T-top roof seams.
 for(const x of [-.96,.96]){const seal=cube(g,.037,.035,1.36,x,1.89,.24,chrome);seal.rotation.z=.008;}
 cube(g,2.13,.024,.036,0,1.886,.2,chrome);
 cube(g,.05,.038,1.38,0,1.898,.24,chrome);
 // Leather door trim and console: readable in cockpit camera.
 for(const s of [-1,1]){
  cube(g,.07,.25,1.42,s*1.04,1.20,.28,burgundy);
  cube(g,.07,.028,.65,s*1.0,1.32,.21,chrome);
 }
 for(let i=0;i<6;i++)cube(g,.28,.018,.025,-.28+i*.11,1.1,-.98,amber);
 // Registration plate uses a local, original image texture.
 const plateTex=panelTexture();
 const rear=new THREE.Mesh(new THREE.PlaneGeometry(.76,.37),new THREE.MeshBasicMaterial({map:plateTex,side:THREE.DoubleSide}));
 rear.position.set(0,.56,2.565);g.add(rear);
 const front=new THREE.Mesh(new THREE.PlaneGeometry(.66,.32),new THREE.MeshBasicMaterial({map:plateTex,side:THREE.DoubleSide}));
 front.position.set(0,.51,-2.655);front.rotation.y=Math.PI;g.add(front);
 // A tiny original dashboard radio with clickable-looking dial (no false interaction).
 cube(g,.38,.13,.035,.42,1.345,-1.168,matte);
 for(let i=0;i<7;i++)cube(g,.024,.049,.008,.27+i*.048,1.35,-1.19,amber);
 return g;
}
