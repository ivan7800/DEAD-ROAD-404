/** Graphics budget presets. Pure data for tests and hardware-safe defaults. */
export type GraphicsPreset = 'rendimiento' | 'equilibrado' | 'cine';
export const GRAPHICS: Readonly<Record<GraphicsPreset, {pixelRatio:number; shadows:boolean; shadowSize:number; exposure:number; label:string}>> = {
  rendimiento:{pixelRatio:.80,shadows:false,shadowSize:512,exposure:1.42,label:'RENDIMIENTO'},
  equilibrado:{pixelRatio:1.0,shadows:true,shadowSize:1024,exposure:1.32,label:'EQUILIBRADO'},
  cine:{pixelRatio:1.35,shadows:true,shadowSize:2048,exposure:1.24,label:'CINEMÁTICO'}
};
const options:GraphicsPreset[]=['rendimiento','equilibrado','cine'];
export function graphicsPreset(value:unknown):GraphicsPreset {return options.includes(value as GraphicsPreset)?value as GraphicsPreset:'equilibrado';}
export function nextGraphicsPreset(value:unknown):GraphicsPreset {
 const at=options.indexOf(graphicsPreset(value));return options[(at+1)%options.length];
}
export function renderPixelRatio(preset:GraphicsPreset,device:number):number {
 const d=Number.isFinite(device)?device:1;
 return Math.max(.5,Math.min(2,Math.max(.5,d)*GRAPHICS[preset].pixelRatio));
}
