/** Lightweight deterministic two-phase PSX boss; finite attack telegraphs, fair cooldowns. */
import {motelCollision} from './motel.ts';
import {WARDEN_POSITION,WARDEN_MAX_HEALTH} from './chapterOne.ts';
export type WardenPhase='chase'|'telegraph'|'recover';
export interface WardenRuntime {x:number;z:number;health:number;phase:WardenPhase;timer:number}
export const freshWarden=(health=WARDEN_MAX_HEALTH):WardenRuntime=>({
 x:WARDEN_POSITION.x,z:WARDEN_POSITION.z,health:Math.max(0,Math.min(WARDEN_MAX_HEALTH,health)),phase:'chase',timer:0
});
export interface WardenStep {warden:WardenRuntime;hit:boolean;alert:boolean}
export function stepWarden(w:WardenRuntime,px:number,pz:number,dt:number):WardenStep{
 const n={...w},dTime=Math.max(0,Math.min(.1,Number.isFinite(dt)?dt:0));
 if(n.health<=0)return {warden:n,hit:false,alert:false};
 const dist=Math.hypot(px-n.x,pz-n.z),alert=dist<16;
 if(n.phase==='telegraph'){
  n.timer=Math.max(0,n.timer-dTime);
  if(n.timer>0)return {warden:n,hit:false,alert};
  n.phase='recover';n.timer=n.health<=WARDEN_MAX_HEALTH/2?.95:1.28;
  return {warden:n,hit:dist<2.25,alert};
 }
 if(n.phase==='recover'){
  n.timer=Math.max(0,n.timer-dTime);
  if(n.timer===0)n.phase='chase';
  return {warden:n,hit:false,alert};
 }
 if(!alert)return {warden:n,hit:false,alert};
 if(dist<2.0){n.phase='telegraph';n.timer=n.health<=WARDEN_MAX_HEALTH/2?.64:.9;return {warden:n,hit:false,alert};}
 if(dist>.01){
  const pace=n.health<=WARDEN_MAX_HEALTH/2?1.7:1.15;
  const step=Math.min((dist-1.75),pace*dTime);
  const dx=(px-n.x)/dist*step,dz=(pz-n.z)/dist*step;
  if(!motelCollision(n.x+dx,n.z+dz,.48)){n.x+=dx;n.z+=dz;}
  else if(!motelCollision(n.x+dx,n.z,.48))n.x+=dx;
  else if(!motelCollision(n.x,n.z+dz,.48))n.z+=dz;
 }
 return {warden:n,hit:false,alert};
}
export function strikeWarden(w:WardenRuntime,px:number,pz:number,yaw:number,damage=30):{warden:WardenRuntime;hit:boolean;defeated:boolean}{
 const dist=Math.hypot(w.x-px,w.z-pz);
 if(w.health<=0||dist<.01||dist>2.95)return {warden:{...w},hit:false,defeated:false};
 const dot=((w.x-px)*Math.sin(yaw)+(w.z-pz)*(-Math.cos(yaw)))/dist;
 if(dot<.2)return {warden:{...w},hit:false,defeated:false};
 const health=Math.max(0,w.health-Math.max(0,damage));
 return {warden:{...w,health,phase:'recover',timer:.40},hit:true,defeated:health===0};
}
