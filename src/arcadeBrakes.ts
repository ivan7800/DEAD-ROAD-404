/** Optional handbrake. Frame-rate-independent, reverse-safe damping. */
export function applyHandbrake(speed:number,dt:number):number {
 if(!Number.isFinite(speed))return 0;
 const bounded=Number.isFinite(dt)?Math.min(.05,Math.max(0,dt)):0;
 const damped=speed*Math.exp(-5.8*bounded);
 return Math.abs(damped)<.025?0:damped;
}
export function brakeLampIntensity(brakeDown:boolean,reverse:boolean):number {
 return brakeDown?2.6:reverse?1.3:.75;
}
