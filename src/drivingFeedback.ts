/** Visual feedback for the Firebird. Side-effect free so QA can verify the thresholds. */
export interface DriveFeedback { intensity:number; particlesPerSecond:number; wheelLean:number; exhaustPitch:number; }
export function driveFeedback(speed:number,steering:number,graphics:'rendimiento'|'equilibrado'|'cine'):DriveFeedback {
  const v=Number.isFinite(speed)?Math.min(23,Math.abs(speed)):0;
  const steer=Number.isFinite(steering)?Math.max(-1,Math.min(1,steering)):0;
  const intensity=Math.max(0,Math.min(1,(v-2.5)/17));
  const budget=graphics==='rendimiento'?0:graphics==='equilibrado'?9:16;
  return {
    intensity,
    particlesPerSecond:budget*intensity,
    wheelLean:steer*Math.min(1,v/12)*.09,
    exhaustPitch:.6+(v/23)*.4
  };
}
