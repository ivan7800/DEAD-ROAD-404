/** Single authoritative station collision map shared by player and enemy. */
export interface Box2 {minX:number;maxX:number;minZ:number;maxZ:number;}
export const STATION_COLLIDERS:ReadonlyArray<Box2>=[
 {minX:7.65,maxX:8.45,minZ:-10.65,maxZ:1.55},
 {minX:21.55,maxX:22.35,minZ:-10.65,maxZ:1.55},
 {minX:8.45,maxX:21.55,minZ:-10.65,maxZ:-10.25},
 {minX:8.45,maxX:13.65,minZ:1.05,maxZ:1.65},
 {minX:16.35,maxX:21.55,minZ:1.05,maxZ:1.65},
 {minX:8.7,maxX:11.6,minZ:-8.6,maxZ:-4.4},
 {minX:18.3,maxX:21.4,minZ:-9.2,maxZ:-4.4},
 {minX:12.5,maxX:17.5,minZ:-3.2,maxZ:-1.55},
 {minX:26.15,maxX:27.85,minZ:2.24,maxZ:3.76},
 {minX:23.02,maxX:24.62,minZ:-.96,maxZ:.56},
];
export function collides(x:number,z:number,radius=.30,boxes:ReadonlyArray<Box2>=STATION_COLLIDERS):boolean {
 return boxes.some(b=>x+radius>b.minX&&x-radius<b.maxX&&z+radius>b.minZ&&z-radius<b.maxZ);
}
export function walkWithSlide(x:number,z:number,dx:number,dz:number,external:(x:number,z:number)=>boolean=()=>false,boxes:ReadonlyArray<Box2>=STATION_COLLIDERS):{x:number;z:number} {
 // Swept movement: small substeps prevent tunnelling through walls on slow frames.
 if(![x,z,dx,dz].every(Number.isFinite))return {x:0,z:0};
 const blocked=(a:number,b:number)=>collides(a,b,.30,boxes)||external(a,b);
 const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dz))/.12));
 const sx=dx/steps,sz=dz/steps;
 let px=x,pz=z;
 for(let i=0;i<steps;i++){
  const nx=Math.max(-40,Math.min(40,px+sx));
  const nz=Math.max(-65,Math.min(45,pz+sz));
  if(!blocked(nx,nz)){px=nx;pz=nz;continue;}
  if(!blocked(nx,pz)){px=nx;continue;}
  if(!blocked(px,nz)){pz=nz;}
 }
 return {x:px,z:pz};
}
