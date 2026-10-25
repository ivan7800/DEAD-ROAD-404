/** GPU frame budgets: never multiply a 4K/retina screen into millions of wasted pixels. */
export type GraphicsPreset = 'rendimiento' | 'equilibrado' | 'cine';
export const GRAPHICS: Readonly<Record<GraphicsPreset, {pixelRatio:number;pixelBudget:number;shadows:boolean;shadowSize:number;exposure:number;label:string}>> = {
 rendimiento:{pixelRatio:.72,pixelBudget:1_000_000,shadows:false,shadowSize:512,exposure:1.42,label:'RENDIMIENTO'},
 equilibrado:{pixelRatio:1,pixelBudget:2_100_000,shadows:false,shadowSize:512,exposure:1.32,label:'EQUILIBRADO'},
 cine:{pixelRatio:1.35,pixelBudget:3_200_000,shadows:true,shadowSize:1024,exposure:1.24,label:'CINEMÁTICO'}
};
const options:GraphicsPreset[]=['rendimiento','equilibrado','cine'];
export function graphicsPreset(value:unknown):GraphicsPreset {return options.includes(value as GraphicsPreset)?value as GraphicsPreset:'equilibrado';}
export function nextGraphicsPreset(value:unknown):GraphicsPreset {
 const at=options.indexOf(graphicsPreset(value));return options[(at+1)%options.length];
}
/** DPR and total framebuffer area capped; dimensions are CSS pixels. */
export function renderPixelRatio(preset:GraphicsPreset,device:number,width=0,height=0):number {
 const d=Number.isFinite(device)?Math.max(.5,device):1;
 const base=Math.min(d*GRAPHICS[preset].pixelRatio,GRAPHICS[preset].pixelRatio);
 const pixels=Number.isFinite(width*height)&&width>0&&height>0?width*height:0;
 const areaCap=pixels?Math.sqrt(GRAPHICS[preset].pixelBudget/pixels):Infinity;
 return Math.max(.5,Math.min(1.35,base,areaCap));
}
