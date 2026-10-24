/** Deterministic arcade vehicle controller, SI metres/second. No renderer dependency. */
export interface DriveState {speed:number;heading:number;steering:number;}
export interface DriveControls {throttle:number;steer:number;handbrake:boolean;}
export const EMPTY_DRIVE:DriveState={speed:0,heading:0,steering:0};
const clamp=(n:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,n));
export function stepArcadeDrive(state:DriveState, controls:DriveControls, dt:number):DriveState {
  if(!Number.isFinite(dt)||dt<=0)return {...state};
  const t=clamp(dt,0,.05);
  const throttle=clamp(controls.throttle,-1,1), steer=clamp(controls.steer,-1,1);
  let speed=Number.isFinite(state.speed)?clamp(state.speed,-9,26):0;
  let heading=Number.isFinite(state.heading)?state.heading:0;
  const oldSteer=Number.isFinite(state.steering)?clamp(state.steering,-1,1):0;
  const steering=oldSteer+(steer-oldSteer)*(1-Math.exp(-9*t));
  // Steering reversal requires speed to change sign, not simply the key pressed.
  const braking=(speed>1&&throttle<0)||(speed< -1&&throttle>0);
  const engine=braking?18:throttle>=0?12.5:7.8;
  speed+=throttle*engine*t;
  // Less drag on idle than former implementation: an actual cruise is possible.
  speed*=Math.exp(-(controls.handbrake?4.5:.24+.014*Math.abs(speed))*t);
  speed=clamp(speed,-9,26);
  if(Math.abs(speed)<.025&&throttle===0)speed=0;
  const grip=Math.min(1,Math.abs(speed)/6);
  const turning=(controls.handbrake?1.32:.75)*grip*steering*(speed>=0?1:-1);
  heading+=turning*t;
  return {speed,heading,steering};
}
export function driveDistance(before:DriveState,after:DriveState,dt:number):number {
  return ((before.speed+after.speed)/2)*Math.max(0,Math.min(.05,dt));
}
