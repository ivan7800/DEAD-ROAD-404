export type SoundMode = 'map'|'drive'|'explore';
export function engineFrequency(speed:number):number {
 const s=Number.isFinite(speed)?Math.abs(speed):0;
 return Math.max(38,Math.min(125,38+s*3.4));
}
export function soundMix(mode:SoundMode,speed:number){
 const moving=Number.isFinite(speed)?Math.min(1,Math.abs(speed)/23):0;
 return {engine: mode==='drive'?.025+.043*moving:mode==='map'?.003:0,
   wind:mode==='explore'?.027:mode==='drive'?.012+.018*moving:.005,
   tension:mode==='explore'?.014:.004};
}
