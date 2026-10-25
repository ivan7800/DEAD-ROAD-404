/** F23: El Campanero — original deterministic two-tempo monster.
 * Attacks are telegraphed, cooldown-bound and distance-avoidable.
 */
import {TOWN_GUARDIAN_HEALTH,TOWN_LOCATIONS} from './chapterThree.ts';
import {townCollision} from './townCollision.ts';
export type GuardianPhase='hunt'|'windup'|'recover';
export interface GuardianRuntime {x:number;z:number;health:number;phase:GuardianPhase;timer:number}
export const freshGuardian=(health=TOWN_GUARDIAN_HEALTH):GuardianRuntime=>({
 x:TOWN_LOCATIONS.guardian.x,z:TOWN_LOCATIONS.guardian.z,
 health:Number.isFinite(health)?Math.max(0,Math.min(TOWN_GUARDIAN_HEALTH,health)):TOWN_GUARDIAN_HEALTH,
 phase:'hunt',timer:0
});
export function updateGuardian(w:GuardianRuntime,px:number,pz:number,dt:number):{guardian:GuardianRuntime;hit:boolean;telegraph:boolean}{
 const n={...w},time=Math.max(0,Math.min(.1,Number.isFinite(dt)?dt:0));
 if(n.health<=0||!Number.isFinite(px)||!Number.isFinite(pz))return {guardian:n,hit:false,telegraph:false};
 const dist=Math.hypot(n.x-px,n.z-pz);
 if(n.phase==='windup'){
  n.timer=Math.max(0,n.timer-time);
  if(n.timer>0)return {guardian:n,hit:false,telegraph:true};
  n.phase='recover';n.timer=.92;
  return {guardian:n,hit:dist<=2.2,telegraph:false};
 }
 if(n.phase==='recover'){
  n.timer=Math.max(0,n.timer-time);
  if(n.timer===0)n.phase='hunt';
  return {guardian:n,hit:false,telegraph:false};
 }
 if(dist>18)return {guardian:n,hit:false,telegraph:false};
 if(dist<2.15){
  n.phase='windup';n.timer=n.health<=60?.62:.94;
  return {guardian:n,hit:false,telegraph:true};
 }
 const step=Math.min((n.health<=60?2.2:1.35)*time,Math.max(0,dist-1.8));
 if(dist>.01){
  const dx=(px-n.x)/dist*step,dz=(pz-n.z)/dist*step;
  if(!townCollision(n.x+dx,n.z+dz)){n.x+=dx;n.z+=dz;}
  else if(!townCollision(n.x+dx,n.z))n.x+=dx;
  else if(!townCollision(n.x,n.z+dz))n.z+=dz;
 }
 return {guardian:n,hit:false,telegraph:false};
}
export function strikeGuardian(w:GuardianRuntime,x:number,z:number,yaw:number,damage=30):
 {guardian:GuardianRuntime;hit:boolean;defeated:boolean}{
 const distance=Math.hypot(w.x-x,w.z-z);
 if(w.health<=0||!Number.isFinite(distance)||distance<.01||distance>3.15)return {guardian:{...w},hit:false,defeated:false};
 const facing=((w.x-x)*Math.sin(yaw)-(w.z-z)*Math.cos(yaw))/distance;
 if(facing<.18)return {guardian:{...w},hit:false,defeated:false};
 const health=Math.max(0,w.health-Math.max(0,Number.isFinite(damage)?damage:0));
 return {guardian:{...w,health,phase:'recover',timer:.43},hit:true,defeated:health===0};
}
