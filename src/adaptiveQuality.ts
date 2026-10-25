import type {GraphicsPreset} from './quality.ts';
/** Hysteretic quality fallback, no sudden oscillation. */
export class AdaptiveQuality{
 private lowSince:number|null=null;
 private lastChange=0;
 private heldUntil=0;
 defer(nowMs:number){this.heldUntil=Math.max(this.heldUntil,nowMs+20_000);this.lowSince=null;}
 reset(){this.lowSince=null;}
 observe(nowMs:number,fps:number,samples:number,active:boolean,preset:GraphicsPreset):GraphicsPreset|null{
  if(!active||!Number.isFinite(nowMs)||!Number.isFinite(fps)||samples<70||fps<=0||preset==='psx'){
   this.lowSince=null;return null;
  }
  if(nowMs<this.heldUntil||nowMs-this.lastChange<10_000){this.lowSince=null;return null;}
  if(fps>=38){this.lowSince=null;return null;}
  if(this.lowSince===null){this.lowSince=nowMs;return null;}
  if(nowMs-this.lowSince<5_000)return null;
  this.lowSince=null;this.lastChange=nowMs;
  return preset==='cine'?'equilibrado':preset==='equilibrado'?'rendimiento':'psx';
 }
}
