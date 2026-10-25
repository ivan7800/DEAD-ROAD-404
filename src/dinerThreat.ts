/** THE LAST LIGHT: stalker with two tempos, visible telegraph, recovery and collision. */
import {DINER_HEALTH,DINER_POSITIONS} from './chapterTwo.ts';
import {dinerCollision} from './dinerCollision.ts';
export type DinerThreatPhase='stalk'|'windup'|'recover';
export interface DinerThreat {x:number;z:number;health:number;phase:DinerThreatPhase;timer:number}
export const freshDinerThreat=(health=DINER_HEALTH):DinerThreat=>({
 x:DINER_POSITIONS.threat.x,z:DINER_POSITIONS.threat.z,
 health:Math.max(0,Math.min(DINER_HEALTH,health)),phase:'stalk',timer:0
});
export function stepDinerThreat(w:DinerThreat,px:number,pz:number,dt:number):{threat:DinerThreat;hit:boolean}{
 const n={...w},time=Math.max(0,Math.min(.1,Number.isFinite(dt)?dt:0));
 if(n.health<=0||!Number.isFinite(px)||!Number.isFinite(pz))return {threat:n,hit:false};
 const distance=Math.hypot(px-n.x,pz-n.z);
 if(n.phase==='windup'){
  n.timer=Math.max(0,n.timer-time);
  if(n.timer>0)return {threat:n,hit:false};
  n.phase='recover';n.timer=.95;
  return {threat:n,hit:distance<2.15};
 }
 if(n.phase==='recover'){
  n.timer=Math.max(0,n.timer-time);
  if(n.timer===0)n.phase='stalk';
  return {threat:n,hit:false};
 }
 if(distance>=16)return {threat:n,hit:false};
 if(distance<2.1){n.phase='windup';n.timer=n.health<=DINER_HEALTH/2?.62:.96;return {threat:n,hit:false};}
 if(distance>.01){
  const pace=n.health<=DINER_HEALTH/2?2.15:1.3;
  const move=Math.min(pace*time,distance-1.9);
  const dx=(px-n.x)/distance*move,dz=(pz-n.z)/distance*move;
  if(!dinerCollision(n.x+dx,n.z+dz)){n.x+=dx;n.z+=dz;}
  else if(!dinerCollision(n.x+dx,n.z))n.x+=dx;
  else if(!dinerCollision(n.x,n.z+dz))n.z+=dz;
 }
 return {threat:n,hit:false};
}
export function strikeDinerThreat(w:DinerThreat,x:number,z:number,yaw:number,damage=30):{threat:DinerThreat;hit:boolean;defeated:boolean}{
 const distance=Math.hypot(w.x-x,w.z-z);
 if(w.health<=0||distance<.01||distance>3)return {threat:{...w},hit:false,defeated:false};
 const facing=((w.x-x)*Math.sin(yaw)-(w.z-z)*Math.cos(yaw))/distance;
 if(facing<.15)return {threat:{...w},hit:false,defeated:false};
 const health=Math.max(0,w.health-Math.max(0,damage));
 return {threat:{...w,health,phase:'recover',timer:.38},hit:true,defeated:health===0};
}
