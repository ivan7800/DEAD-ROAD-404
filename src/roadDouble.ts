/** The Double — telegraphed pursuit, fast second phase and positional melee. */
import {END_POSITIONS,ROAD_DOUBLE_HEALTH} from './chapterSix.ts';
import {roadEndCollision} from './roadEndCollision.ts';
export type DoublePhase='seek'|'warn'|'recover';
export interface DoubleState{x:number;z:number;health:number;phase:DoublePhase;timer:number}
export const freshRoadDouble=(health=ROAD_DOUBLE_HEALTH):DoubleState=>({
 x:END_POSITIONS.double.x,z:END_POSITIONS.double.z,
 health:Number.isFinite(health)?Math.max(0,Math.min(ROAD_DOUBLE_HEALTH,health)):ROAD_DOUBLE_HEALTH,
 phase:'seek',timer:0
});
export function stepRoadDouble(w:DoubleState,px:number,pz:number,dt:number):
 {double:DoubleState;hit:boolean;telegraph:boolean}{
 const n={...w},t=Math.max(0,Math.min(.1,Number.isFinite(dt)?dt:0));
 if(n.health<=0||!Number.isFinite(px)||!Number.isFinite(pz))
  return {double:n,hit:false,telegraph:false};
 const dist=Math.hypot(n.x-px,n.z-pz);
 if(n.phase==='warn'){
  n.timer=Math.max(0,n.timer-t);
  if(n.timer>0)return {double:n,hit:false,telegraph:true};
  n.phase='recover';n.timer=.85;
  return {double:n,hit:dist<2.4,telegraph:false};
 }
 if(n.phase==='recover'){
  n.timer=Math.max(0,n.timer-t);
  if(n.timer===0)n.phase='seek';
  return {double:n,hit:false,telegraph:false};
 }
 if(dist>18)return {double:n,hit:false,telegraph:false};
 if(dist<2.25){n.phase='warn';n.timer=n.health<=70?.6:1.02;return {double:n,hit:false,telegraph:true};}
 const step=Math.min((n.health<=70?2.6:1.7)*t,Math.max(0,dist-1.85));
 if(dist>.01){
  const dx=(px-n.x)*step/dist,dz=(pz-n.z)*step/dist;
  if(!roadEndCollision(n.x+dx,n.z+dz)){n.x+=dx;n.z+=dz;}
  else if(!roadEndCollision(n.x+dx,n.z))n.x+=dx;
  else if(!roadEndCollision(n.x,n.z+dz))n.z+=dz;
 }
 return {double:n,hit:false,telegraph:false};
}
export function strikeRoadDouble(w:DoubleState,x:number,z:number,yaw:number,damage=35):
 {double:DoubleState;hit:boolean;defeated:boolean}{
 const dist=Math.hypot(w.x-x,w.z-z);
 if(w.health<=0||!Number.isFinite(dist)||dist<.01||dist>3.25)
  return {double:{...w},hit:false,defeated:false};
 const facing=((w.x-x)*Math.sin(yaw)-(w.z-z)*Math.cos(yaw))/dist;
 if(!Number.isFinite(facing)||facing<.18)return {double:{...w},hit:false,defeated:false};
 const health=Math.max(0,w.health-Math.max(0,Number.isFinite(damage)?damage:0));
 return {double:{...w,health,phase:'recover',timer:.42},hit:true,defeated:health===0};
}
