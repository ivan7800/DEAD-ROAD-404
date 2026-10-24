import * as THREE from 'three';
/** Interior y detalles originales de época para la silueta procedural del Firebird. */
function part(p:THREE.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;p.add(mesh);return mesh;
}
const black=new THREE.MeshStandardMaterial({color:0x19181c,roughness:.85});
const vinyl=new THREE.MeshStandardMaterial({color:0x48352f,roughness:.91});
const brass=new THREE.MeshStandardMaterial({color:0xc69b54,metalness:.61,roughness:.48});
const green=new THREE.MeshBasicMaterial({color:0x91b98a});
const warm=new THREE.MeshBasicMaterial({color:0xd9954a});
export function buildFirebird1992(body:THREE.Group):THREE.Group {
 const parts=new THREE.Group();body.add(parts);
 // Apariencia de Trans Am veterano: filetes laterales y molduras, sin emblemas comerciales.
 for(const side of [-1,1]){
  part(parts,.035,.035,3.46,side*1.265,.77,.02,brass);
  part(parts,.046,.18,.11,side*1.273,.95,-.29,brass);
  // Pilotos laterales y manilla con perfil 3D.
  part(parts,.045,.17,.40,side*1.275,.78,2.18,warm);
  part(parts,.08,.07,.32,side*1.27,1.04,.35,brass);
  part(parts,.065,.045,.65,side*1.26,.49,-.90,black);
 }
 // Conjunto analógico: radio de cassette y panel de climatización entre asientos.
 part(parts,.50,.23,.065,.43,1.38,-1.085,black);
 part(parts,.30,.073,.009,.41,1.409,-1.126,green);
 part(parts,.20,.032,.013,.41,1.340,-1.127,brass);
 for(const x of [.16,.68]){
  const knob=new THREE.Mesh(new THREE.CylinderGeometry(.058,.058,.058,12),brass);
  knob.rotation.x=Math.PI/2;knob.position.set(x,1.40,-1.15);parts.add(knob);
 }
 // Salidas de aire: lamas oscuras con acabado metálico.
 for(const x of [-.16,.87]){
  part(parts,.27,.20,.035,x,1.36,-1.083,black);
  for(let i=0;i<3;i++)part(parts,.25,.015,.042,x,1.30+i*.055,-1.104,brass);
 }
 // Espejo retrovisor, palanca de cambios y guantera.
 part(parts,.51,.14,.052,0,1.80,-.75,black);
 part(parts,.35,.045,.023,0,1.80,-.781,brass);
 part(parts,.62,.17,.045,.77,1.18,-1.061,vinyl);
 const shifter=new THREE.Mesh(new THREE.CylinderGeometry(.025,.028,.42,8),brass);
 shifter.rotation.z=.21;shifter.position.set(.08,1.31,.19);parts.add(shifter);
 const knob=new THREE.Mesh(new THREE.SphereGeometry(.10,10,8),black);knob.position.set(.04,1.52,.19);parts.add(knob);
 // Instrumentos nocturnos discretos, sin interferir con la lectura del HUD.
 for(const x of [-.72,-.38])for(let i=0;i<5;i++){
  const q=new THREE.Mesh(new THREE.BoxGeometry(.015,.024,.008),green);
  const a=(i/4)*Math.PI*1.55-.65;q.position.set(x+Math.sin(a)*.105,1.39+Math.cos(a)*.104,-1.046);q.rotation.z=-a;parts.add(q);
 }
 // Tapicería desgastada y cinturones sobre los asientos delanteros.
 for(const x of [-.53,.53]){
  const belt=part(parts,.048,.54,.014,x+.27,1.47,.879,brass);belt.rotation.z=.16;
  part(parts,.73,.025,.66,x,1.222,.60,vinyl);
 }
 return parts;
}
