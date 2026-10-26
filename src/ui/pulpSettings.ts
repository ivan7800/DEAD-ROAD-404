/** F24 — visual/audio preferences separate from F19–F23 saved game state. */
export type PulpSettings={
 grain:boolean;reducedMotion:boolean;highContrast:boolean;largeText:boolean;volume:number;mouseSensitivity:number;gamepadSensitivity:number;invertY:boolean
};
export const PULP_PREF_KEY='dead-road-404-pulp-ui-v1';
export const DEFAULT_PULP_SETTINGS:Readonly<PulpSettings>=Object.freeze({
 grain:true,reducedMotion:false,highContrast:false,largeText:false,volume:65,mouseSensitivity:100,gamepadSensitivity:100,invertY:false
});
function normalizeSensitivity(value:unknown):number{return typeof value==='number'&&Number.isFinite(value)?Math.max(25,Math.min(200,Math.round(value))):100;}
export function normalizePulpSettings(input:unknown):PulpSettings{
 const obj=input&&typeof input==='object'&&!Array.isArray(input)?input as Partial<PulpSettings>:{};
 const volume=typeof obj.volume==='number'&&Number.isFinite(obj.volume)?
  Math.max(0,Math.min(100,Math.round(obj.volume))):DEFAULT_PULP_SETTINGS.volume;
 return {
  grain:typeof obj.grain==='boolean'?obj.grain:DEFAULT_PULP_SETTINGS.grain,
  reducedMotion:typeof obj.reducedMotion==='boolean'?obj.reducedMotion:DEFAULT_PULP_SETTINGS.reducedMotion,
  highContrast:typeof obj.highContrast==='boolean'?obj.highContrast:DEFAULT_PULP_SETTINGS.highContrast,
  largeText:typeof obj.largeText==='boolean'?obj.largeText:DEFAULT_PULP_SETTINGS.largeText,
  volume,
  mouseSensitivity:normalizeSensitivity(obj.mouseSensitivity),
  gamepadSensitivity:normalizeSensitivity(obj.gamepadSensitivity),
  invertY:typeof obj.invertY==='boolean'?obj.invertY:false
 };
}
export function parsePulpSettings(json:string|null):PulpSettings{
 if(!json)return normalizePulpSettings(null);
 try{return normalizePulpSettings(JSON.parse(json));}
 catch{return normalizePulpSettings(null);}
}
export function shouldAnimatePulp(userReduced:boolean,systemReduced:boolean):boolean{
 return !userReduced&&!systemReduced;
}
export type PulpScreen='pause'|'options'|'chapters'|'credits';
export const PULP_SCREENS:ReadonlyArray<PulpScreen>=['pause','options','chapters','credits'];
/** Separates the visual card from active game transitions. */
export function titleForLocation(mode:'map'|'drive'|'explore',place:'town'|'diner'|'station'|'radio'|'mile'|'road-end'='station'):
 {eyebrow:string;title:string;subtitle:string}{
 if(mode==='drive')return {eyebrow:'CARRETERA 404 · LADO A',title:'EL ASFALTO NO OLVIDA',subtitle:'NOCHE CERRADA · OCTUBRE 1992'};
 if(mode==='explore'&&place==='road-end')return {eyebrow:'CAPÍTULO VI · KM 120',title:'DONDE TERMINA LA CARRETERA',subtitle:'LA ÚLTIMA BARRERA · 02:17'};
 if(mode==='explore'&&place==='mile')return {eyebrow:'CAPÍTULO V · KM 96',title:'EL KILÓMETRO IMPOSIBLE',subtitle:'NO TODAS LAS DISTANCIAS SON REALES'};
 if(mode==='explore'&&place==='radio')return {eyebrow:'CAPÍTULO IV · KM 72',title:'FRECUENCIA MUERTA',subtitle:'EMISORA WXR-404 · PROYECTO UMBRAL'};
 if(mode==='explore'&&place==='town')return {eyebrow:'CAPÍTULO III · 03:13 AM',title:'EL PUEBLO SIN NOMBRE',subtitle:'NO FIGURA EN NINGÚN MAPA'};
 if(mode==='explore'&&place==='diner')return {eyebrow:'CAPÍTULO II · KM 24',title:'THE LAST LIGHT',subtitle:'ABIERTO DESDE 1992'};
 if(mode==='explore')return {eyebrow:'CAPÍTULO I · 02:17 AM',title:'LA ÚLTIMA PARADA',subtitle:'SUNSPUR · MILE 404'};
 return {eyebrow:'INTERMEDIO · CARRETERA 404',title:'CONTINÚA LA TRANSMISIÓN',subtitle:'SIN SEÑAL · SIN SALIDA'};
}
