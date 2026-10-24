import * as THREE from 'three';

/** Procedural, original artwork. Generated locally; no CDN, paid assets or runtime downloads. */
function hash(x: number, y: number, seed: number): number {
  let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
function texture(w: number, h: number, painter: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D no disponible para generar materiales');
  painter(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

export function createAsphalt(): THREE.MeshStandardMaterial {
  const map=texture(512,512,c=>{
    c.fillStyle='#25232a';c.fillRect(0,0,512,512);
    for(let i=0;i<15500;i++){
      const x=hash(i,11,2)*512,y=hash(i,37,9)*512,b=Math.floor(30+hash(i,73,6)*50);
      c.fillStyle=`rgba(${b+8},${b+2},${b+11},${.05+hash(i,13,1)*.25})`;
      c.fillRect(x,y,1+hash(i,17,2)*3,1+hash(i,31,4)*3);
    }
    c.strokeStyle='rgba(4,3,5,.58)';c.lineWidth=2;
    c.beginPath();c.moveTo(20,0);c.bezierCurveTo(115,70,20,125,210,240);
    c.bezierCurveTo(300,320,155,420,210,512);c.stroke();
    c.strokeStyle='rgba(181,147,116,.16)';c.lineWidth=1;c.beginPath();c.moveTo(230,0);c.lineTo(212,512);c.stroke();
  });
  map.repeat.set(3,40);const m=new THREE.MeshStandardMaterial({map,roughness:1,metalness:0});return m;
}
export function createPlaster(): THREE.MeshStandardMaterial {
  const map=texture(256,256,c=>{
    c.fillStyle='#8a7164';c.fillRect(0,0,256,256);
    for(let i=0;i<5000;i++){
      const x=hash(i,1,15)*256,y=hash(i,2,8)*256;
      c.fillStyle=hash(i,9,1)>.45?'rgba(27,16,22,.16)':'rgba(242,190,134,.12)';
      c.fillRect(x,y,hash(i,3,17)*13+1,hash(i,5,4)*5+1);
    }
    c.strokeStyle='rgba(47,21,21,.29)';c.lineWidth=1;
    for(let i=0;i<8;i++){
      const x=hash(i,77,1)*256,y=hash(i,71,2)*256;
      c.beginPath();c.moveTo(x,y);c.lineTo(x+15,y+23);c.lineTo(x+10,y+56);c.stroke();
    }
    c.fillStyle='rgba(36,24,24,.29)';c.fillRect(0,240,256,16);
  });
  map.repeat.set(2,1.5);return new THREE.MeshStandardMaterial({map,roughness:.93});
}
export function createRust(): THREE.MeshStandardMaterial {
  const map=texture(256,256,c=>{
    c.fillStyle='#5e3634';c.fillRect(0,0,256,256);
    for(let i=0;i<3600;i++){
      const x=hash(i,4,7)*256,y=hash(i,18,3)*256,a=hash(i,28,12);
      c.fillStyle=a>.51?'rgba(179,89,52,.22)':'rgba(24,17,22,.24)';
      c.fillRect(x,y,1+hash(i,1,8)*17,1+hash(i,2,18)*7);
    }
    for(let i=0;i<13;i++){const x=hash(i,1,19)*256;c.fillStyle='rgba(22,17,23,.23)';c.fillRect(x,0,1+hash(i,2,5)*6,30+hash(i,3,7)*175);}
  });
  map.repeat.set(2,2);return new THREE.MeshStandardMaterial({map,metalness:.22,roughness:.85});
}
export function createDecal(lines: string[], background='#201b24', ink='#f4d2a3', border='#b76c50'): THREE.CanvasTexture {
  return texture(512,256,c=>{
    c.fillStyle=background;c.fillRect(0,0,512,256);
    c.fillStyle=border;c.fillRect(12,12,488,232);c.fillStyle=background;c.fillRect(21,21,470,214);
    for(let y=0;y<256;y+=4){c.fillStyle=`rgba(0,0,0,${hash(y,0,8)*.14})`;c.fillRect(0,y,512,1);}
    lines.forEach((line,i)=>{
      c.font=`bold ${lines.length===1?75: i===0?68:38}px Georgia, serif`;
      c.textAlign='center';c.textBaseline='middle';c.fillStyle=ink;c.shadowColor=border;c.shadowBlur=5;
      c.fillText(line,256,lines.length===1?128:87+i*88,472);
    });
    c.shadowBlur=0;
  });
}
function plane(group:THREE.Group,w:number,h:number,x:number,y:number,z:number,map:THREE.Texture,glow=0):void{
  const material=new THREE.MeshStandardMaterial({map,transparent:false,side:THREE.DoubleSide,roughness:.82,
    emissive:new THREE.Color(0xffffff),emissiveMap:glow?map:null,emissiveIntensity:glow});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);
  mesh.position.set(x,y,z);group.add(mesh);
}
function cube(group:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,material:THREE.Material):void{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
}

/** Composed outside the original traversable corridor: purely decorative meshes. */
export class RoadsideArt {
  readonly group = new THREE.Group();
  private dust:THREE.Points;
  private signPulse=new THREE.PointLight(0xff6d46,8,13,2);
  constructor(){
    const black = new THREE.MeshStandardMaterial({color:0x19191e,roughness:.85});
    const gold = new THREE.MeshStandardMaterial({color:0xcba46f,metalness:.5,roughness:.48});
    const silver = new THREE.MeshStandardMaterial({color:0x92908c,metalness:.7,roughness:.35});
    const signage=createDecal(['LAST STOP','GAS · FOOD · 24H'],'#261a23','#f5d09a','#b9503f');
    // Large, legible station sign facing the carriageway and the store entrance.
    cube(this.group,9.3,1.9,.32,15,5.8,1.14,black);
    plane(this.group,8.95,1.6,15,5.8,1.325,signage,.58);
    for(const x of [10.4,19.6]){
      cube(this.group,.22,1.9,.42,x,5.8,1.12,gold);
      cube(this.group,.24,1.7,.2,x,5.75,1.38,silver);
    }
    const motel = createDecal(['NO VACANCY','404 MOTEL'],'#31151f','#f2b48a','#dc4a5a');
    cube(this.group,5.35,2.7,.33,-20,4.9,-40.91,black);
    plane(this.group,5.05,2.35,-20,4.9,-40.71,motel,.62);
    this.signPulse.position.set(-20,5.3,-40);this.group.add(this.signPulse);
    // Store interior: fridge signage, advertisements and a backlit payphone.
    plane(this.group,2.4,1.0,18.9,3.42,-8.32,createDecal(['COLD','SODA'],'#1a404a','#bed4c5','#569eac'),.15);
    plane(this.group,2.15,1.05,10.5,3.3,-10.57,createDecal(['NEVER','STOP'],'#342027','#ddaf78','#aa5044'),.1);
    cube(this.group,.44,1.03,.32,21.54,1.22,-2.6,black);
    plane(this.group,.25,.5,21.29,1.3,-2.43,createDecal(['PHONE'],'#454046','#f7d2a5','#a74c44'));
    // Old tires, pumps, wiring and bollards live outside major mission routes.
    for(const [x,z] of [[7.2,8.8],[22.8,8.5],[27,5]]){
      cube(this.group,.56,.72,.56,x,.4,z,black);
      cube(this.group,.61,.12,.62,x,.74,z,gold);
      cube(this.group,.15,.85,.19,x,1.08,z,black);
    }
    const rail=new THREE.MeshStandardMaterial({color:0x5f4d4b,roughness:.81,metalness:.12});
    for(let i=0;i<8;i++){
      const z=-21-i*4;
      cube(this.group,.11,1.02,.11,6.3,.51,z,rail);
      cube(this.group,.08,.8,.13,6.22,.48,z,gold);
    }
    // Windborne dust is deterministic and very cheap to draw (one point cloud).
    const p:number[]=[];
    for(let i=0;i<460;i++){
      const x=-27+hash(i,1,5)*56,y=.2+hash(i,2,7)*11,z=-57+hash(i,3,9)*92;
      p.push(x,y,z);
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
    this.dust=new THREE.Points(geometry,new THREE.PointsMaterial({color:0xc9a693,size:.085,transparent:true,opacity:.34,depthWrite:false,sizeAttenuation:true}));
    this.group.add(this.dust);
  }
  animate(time:number,ambient:boolean){this.dust.rotation.y=Math.sin(time*.08)*.004;this.signPulse.intensity=ambient?9+3*Math.sin(time*4.5):5;}
}
