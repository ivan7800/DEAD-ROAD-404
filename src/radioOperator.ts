/** F25: The Operator. Original signal-anomaly hunter with telegraph, recovery and 2 tempos. */
import {RADIO_OPERATOR_HEALTH,RADIO_POSITIONS} from './chapterFour.ts';
import {radioCollision} from './radioCollision.ts';
export type OperatorPhase='seek'|'warn'|'recover';
export interface OperatorState{x:number;z:number;health:number;phase:OperatorPhase;timer:number}
export const freshRadioOperator=(health=RADIO_OPERATOR_HEALTH):OperatorState=>({
 x:RADIO_POSITIONS.operator.x,z:RADIO_POSITIONS.operator.z,
 health:Number.isFinite(health)?Math.max(0,Math.min(RADIO_OPERATOR_HEALTH,health)):RADIO_OPERATOR_HEALTH,
 phase:'seek',timer:0
});
export function updateRadioOperator(w:OperatorState,px:number,pz:number,dt:number):{operator:OperatorState;hit:boolean;telegraph:boolean}{
 const n={...w},time=Math.max(0,Math.min(.1,Number.isFinite(dt)?dt:0));
 if(n.health<=0||!Number.isFinite(px)||!Number.isFinite(pz))return {operator:n,hit:false,telegraph:false};
 const dist=Math.hypot(n.x-px,n.z-pz);
 if(n.phase==='warn'){
  n.timer=Math.max(0,n.timer-time);
  if(n.timer>0)return {operator:n,hit:false,telegraph:true};
  n.phase='recover';n.timer=n.health<=75?.72:.9;
  return {operator:n,hit:dist<2.25,telegraph:false};
 }
 if(n.phase==='recover'){
  n.timer=Math.max(0,n.timer-time);
  if(n.timer===0)n.phase='seek';
  return {operator:n,hit:false,telegraph:false};
 }
 if(dist>15)return {operator:n,hit:false,telegraph:false};
 if(dist<2.16){n.phase='warn';n.timer=n.health<=75?.66:1.02;return {operator:n,hit:false,telegraph:true};}
 const step=Math.min((n.health<=75?2.35:1.25)*time,Math.max(0,dist-1.9));
 if(dist>.01){
  const dx=(px-n.x)/dist*step,dz=(pz-n.z)/dist*step;
  if(!radioCollision(n.x+dx,n.z+dz)){n.x+=dx;n.z+=dz;}
  else if(!radioCollision(n.x+dx,n.z))n.x+=dx;
  else if(!radioCollision(n.x,n.z+dz))n.z+=dz;
 }
 return {operator:n,hit:false,telegraph:false};
}
export function strikeRadioOperator(w:OperatorState,x:number,z:number,yaw:number,damage=30):
 {operator:OperatorState;hit:boolean;defeated:boolean}{
 const dist=Math.hypot(w.x-x,w.z-z);
 if(w.health<=0||!Number.isFinite(dist)||dist<.01||dist>3.2)return {operator:{...w},hit:false,defeated:false};
 const facing=((w.x-x)*Math.sin(yaw)-(w.z-z)*Math.cos(yaw))/dist;
 if(facing<.18)return {operator:{...w},hit:false,defeated:false};
 const health=Math.max(0,w.health-Math.max(0,Number.isFinite(damage)?damage:0));
 return {operator:{...w,health,phase:'recover',timer:.38},hit:true,defeated:health===0};
}
