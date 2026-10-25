/** PSX frame budgets: true low-resolution framebuffer at any display density. */
export type GraphicsPreset='psx'|'rendimiento'|'equilibrado'|'cine';
export const GRAPHICS:Readonly<Record<GraphicsPreset,{pixelRatio:number;pixelBudget:number;shadows:boolean;shadowSize:number;exposure:number;label:string}>>={
 psx:{pixelRatio:.6,pixelBudget:426*240,shadows:false,shadowSize:256,exposure:1.15,label:'PSX · 240P'},
 rendimiento:{pixelRatio:.8,pixelBudget:512*288,shadows:false,shadowSize:256,exposure:1.15,label:'PSX · 288P'},
 equilibrado:{pixelRatio:1,pixelBudget:640*360,shadows:false,shadowSize:256,exposure:1.15,label:'PSX · 360P'},
 cine:{pixelRatio:1.25,pixelBudget:800*450,shadows:false,shadowSize:256,exposure:1.15,label:'PSX · 450P'}
};
const options:GraphicsPreset[]=['psx','rendimiento','equilibrado','cine'];
export function graphicsPreset(value:unknown):GraphicsPreset{
 return options.includes(value as GraphicsPreset)?value as GraphicsPreset:'psx';
}
export function nextGraphicsPreset(value:unknown):GraphicsPreset{
 const at=options.indexOf(graphicsPreset(value));return options[(at+1)%options.length];
}
/** Constrain framebuffer area to the preset resolution for any CSS canvas size. */
export function renderPixelRatio(preset:GraphicsPreset,device:number,width=0,height=0):number{
 const d=Number.isFinite(device)?Math.max(.5,device):1;
 const baseline=Math.min(d*GRAPHICS[preset].pixelRatio,GRAPHICS[preset].pixelRatio);
 const pixels=Number.isFinite(width*height)&&width>0&&height>0?width*height:0;
 if(!pixels)return Math.max(.5,Math.min(1.35,baseline));
 return Math.max(.06,Math.min(1.35,baseline,Math.sqrt(GRAPHICS[preset].pixelBudget/pixels)));
}
