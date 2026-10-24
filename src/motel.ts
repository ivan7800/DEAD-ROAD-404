/** Optional motel discovery. Kept independent from rendering for deterministic tests. */
export const TAPE_POSITION={x:-20,z:-45};
export function isNearTape(x:number,z:number,radius=2.5){return Math.hypot(x-TAPE_POSITION.x,z-TAPE_POSITION.z)<radius;}
export function collectTape(s:{motelTape:boolean;parts:number;food:number}){
 if(s.motelTape)return {...s,collected:false};
 return {...s,motelTape:true,parts:s.parts+1,food:s.food+2,collected:true};
}
export function motelCollision(x:number,z:number,r=.33){
 const hit=(a:number,b:number,c:number,d:number)=>x+r>a&&x-r<b&&z+r>c&&z-r<d;
 // Main bedroom occupies x[-24,-16], z[-49,-41] with an open south-facing doorway.
 return hit(-24.4,-23.8,-49.5,-40.8)||hit(-16.2,-15.6,-49.5,-40.8)||
  hit(-24.4,-15.6,-49.5,-48.9)||
  (hit(-24.4,-21.5,-41.1,-40.7)||hit(-18.5,-15.6,-41.1,-40.7))||
  hit(-23.6,-22.1,-47.4,-45.5)||hit(-17.9,-16.5,-46.7,-44.8);
}
