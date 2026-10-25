/** F26 — The Surveyor. Telegraph-and-recover melee AI, without dynamic lights. */
import {MILE_HUNTER_HEALTH,MILE_POSITIONS} from './chapterFive.ts';
import {mileCollision} from './mileCollision.ts';
export type MileHunterPhase='approach'|'telegraph'|'recover';
export interface MileHunterState {
 x:number;z:number;health:number;phase:MileHunterPhase;timer:number;
}
export const freshMileHunter=(health=MILE_HUNTER_HEALTH):MileHunterState=>({
 x:MILE_POSITIONS.hunter.x,z:MILE_POSITIONS.hunter.z,
 health:Number.isFinite(health)?Math.max(0,Math.min(MILE_HUNTER_HEALTH,health)):MILE_HUNTER_HEALTH,
 phase:'approach',timer:0
});
export function stepMileHunter(w:MileHunterState,px:number,pz:number,dt:number):
 {hunter:MileHunterState;hit:boolean;telegraph:boolean}{
 const n={...w},time=Math.max(0,Math.min(.1,Number.isFinite(dt)?dt:0));
 if(n.health<=0||!Number.isFinite(px)||!Number.isFinite(pz))return {hunter:n,hit:false,telegraph:false};
 const dist=Math.hypot(n.x-px,n.z-pz);
 if(n.phase==='telegraph'){
  n.timer=Math.max(0,n.timer-time);
  if(n.timer>0)return {hunter:n,hit:false,telegraph:true};
  n.phase='recover';n.timer=.8;
  return {hunter:n,hit:dist<2.3,telegraph:false};
 }
 if(n.phase==='recover'){
  n.timer=Math.max(0,n.timer-time);
  if(n.timer===0)n.phase='approach';
  return {hunter:n,hit:false,telegraph:false};
 }
 if(dist>16)return {hunter:n,hit:false,telegraph:false};
 if(dist<2.2){n.phase='telegraph';n.timer=n.health<=60?.57:.95;return {hunter:n,hit:false,telegraph:true};}
 const step=Math.min((n.health<=60?2.4:1.6)*time,Math.max(0,dist-1.85));
 if(dist>.01){
  const dx=(px-n.x)*step/dist,dz=(pz-n.z)*step/dist;
  if(!mileCollision(n.x+dx,n.z+dz)){n.x+=dx;n.z+=dz;}
  else if(!mileCollision(n.x+dx,n.z))n.x+=dx;
  else if(!mileCollision(n.x,n.z+dz))n.z+=dz;
 }
 return {hunter:n,hit:false,telegraph:false};
}
export function strikeMileHunter(w:MileHunterState,x:number,z:number,yaw:number,damage=30):
 {hunter:MileHunterState;hit:boolean;defeated:boolean}{
 const dist=Math.hypot(w.x-x,w.z-z);
 if(w.health<=0||!Number.isFinite(dist)||dist<.01||dist>3.2)return {hunter:{...w},hit:false,defeated:false};
 const facing=((w.x-x)*Math.sin(yaw)-(w.z-z)*Math.cos(yaw))/dist;
 if(!Number.isFinite(facing)||facing<.18)return {hunter:{...w},hit:false,defeated:false};
 const health=Math.max(0,w.health-Math.max(0,Number.isFinite(damage)?damage:0));
 return {hunter:{...w,health,phase:'recover',timer:.4},hit:true,defeated:health===0};
}
