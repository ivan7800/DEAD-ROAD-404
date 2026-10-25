/** DEAD ROAD 404 — Capítulo I: La Última Parada. Gameplay rules independent of WebGL. */
import {completeChapter,recordMilestone} from './campaign.ts';
import type {GameState} from './state.ts';

export type ChapterOneStage='sealed'|'fuse'|'panel'|'tuning'|'hatch'|'fight'|'choice'|'complete';
export type ChapterOneDecision='destroy'|'preserve';
export interface ChapterOneProgress{
 stage:ChapterOneStage;
 attempts:number;
 wardenHealth:number;
 decision:ChapterOneDecision|null;
}
export const FUSE_POSITION={x:25,z:7} as const;
export const CONSOLE_POSITION={x:14,z:5} as const;
export const HATCH_POSITION={x:-20,z:-36} as const;
export const WARDEN_POSITION={x:-17,z:-32} as const;
export const WARDEN_MAX_HEALTH=120;
export const FREQUENCIES=[170,217,404] as const;
const stages:ChapterOneStage[]=['sealed','fuse','panel','tuning','hatch','fight','choice','complete'];
export const freshChapterOne=():ChapterOneProgress=>({stage:'sealed',attempts:0,wardenHealth:WARDEN_MAX_HEALTH,decision:null});
/** F20/F19 players who already finished Vera must not lose access to the road.
 * Only newly resolved conversations trigger the new extended chapter.
 */
export function normalizeChapterOne(value:unknown,missionAlreadyResolved:boolean):ChapterOneProgress{
 if(!value||typeof value!=='object')return missionAlreadyResolved?
  {stage:'complete',attempts:0,wardenHealth:0,decision:null}:freshChapterOne();
 const v=value as Partial<ChapterOneProgress>;
 const stage:ChapterOneStage=stages.includes(v.stage as ChapterOneStage)?v.stage as ChapterOneStage:'sealed';
 const attempts=typeof v.attempts==='number'&&Number.isFinite(v.attempts)?
  Math.max(0,Math.min(999,Math.floor(v.attempts))):0;
 const health=typeof v.wardenHealth==='number'&&Number.isFinite(v.wardenHealth)?
  Math.max(0,Math.min(WARDEN_MAX_HEALTH,Math.floor(v.wardenHealth))):WARDEN_MAX_HEALTH;
 const decision=v.decision==='destroy'||v.decision==='preserve'?v.decision:null;
 return {stage:stage==='fight'&&health===0?'choice':stage,attempts,wardenHealth:stage==='choice'||stage==='complete'?0:health,decision:stage==='complete'?decision:null};
}
export function nearChapterProp(x:number,z:number,p:{x:number;z:number},radius=2.3):boolean{
 return Number.isFinite(x)&&Number.isFinite(z)&&Math.hypot(x-p.x,z-p.z)<=radius;
}
export function beginChapterOne(s:GameState):GameState{
 if(s.mission.stage!=='resolved'||s.chapterOne.stage!=='sealed')return s;
 return {...s,chapterOne:{...s.chapterOne,stage:'fuse'},
  message:'Vera señala un generador junto a SUNSPUR. La estación emite una segunda señal. Busca el fusible al este.'};
}
export function chapterOneObjective(s:GameState):string{
 if(s.mission.stage!=='resolved')return '';
 switch(s.chapterOne.stage){
  case 'sealed':return '';
  case 'fuse':return 'CAPÍTULO I · Busca el FUSIBLE del generador, al este de los surtidores [E]';
  case 'panel':return 'CAPÍTULO I · Lleva el fusible al cuadro eléctrico SUNSPUR [E]';
  case 'tuning':return 'CAPÍTULO I · Sintoniza el cuadro de radio: la hora congelada 02:17 [E]';
  case 'hatch':return 'CAPÍTULO I · Abre el registro frente al motel MILE 404 [E]';
  case 'fight':return 'CAPÍTULO I · EL CELADOR DE LA FRECUENCIA · [F] atacar · [SHIFT] esquivar';
  case 'choice':return 'CAPÍTULO I · Decide qué hacer con la transmisión bajo el motel';
  case 'complete':return '';
 }
}
export function collectChapterFuse(s:GameState):GameState{
 if(s.chapterOne.stage!=='fuse')return {...s,message:'El generador está vacío.'};
 return {...s,chapterOne:{...s.chapterOne,stage:'panel'},
  campaign:recordMilestone(s.campaign,'fuse'),
  message:'Consigues el fusible oxidado. La etiqueta dice «02:17». Llévalo al cuadro de SUNSPUR.'};
}
export function powerChapterConsole(s:GameState):GameState{
 if(s.chapterOne.stage==='fuse')return {...s,message:'Falta el fusible: revisa el generador al este de los surtidores.'};
 if(s.chapterOne.stage!=='panel')return {...s,message:'El cuadro eléctrico zumba con una frecuencia sin emisora.'};
 return {...s,chapterOne:{...s.chapterOne,stage:'tuning'},
  campaign:recordMilestone(s.campaign,'relay'),
  message:'El relé despierta y aparecen tres frecuencias. Recuerda la hora que no avanza: 02:17.'};
}
export function tuneChapterFrequency(s:GameState,frequency:number):GameState{
 if(s.chapterOne.stage!=='tuning')return s;
 if(frequency!==217)return {...s,chapterOne:{...s.chapterOne,attempts:Math.min(999,s.chapterOne.attempts+1)},
  message:'ERROR DE SINTONÍA '+frequency+'. La radio repite: «No es un kilómetro; es una hora». Prueba otra frecuencia.'};
 return {...s,chapterOne:{...s.chapterOne,stage:'hatch'},
  campaign:recordMilestone(s.campaign,'frequency'),
  message:'217 kHz. La voz susurra: «Registro de mantenimiento, delante del motel». La cerradura se abre.'};
}
export function openChapterHatch(s:GameState):GameState{
 if(s.chapterOne.stage!=='hatch')return {...s,message:'La escotilla sigue sellada. Resuelve la frecuencia del cuadro de SUNSPUR.'};
 return {...s,chapterOne:{...s.chapterOne,stage:'fight',wardenHealth:WARDEN_MAX_HEALTH},
  campaign:recordMilestone(s.campaign,'hatch'),
  message:'LA ESCOTILLA SE ABRE. Del conducto emerge EL CELADOR, que lleva tu matrícula colgada del cuello.'};
}
export function defeatChapterWarden(s:GameState):GameState{
 if(s.chapterOne.stage!=='fight'||s.chapterOne.wardenHealth>0)return s;
 return {...s,chapterOne:{...s.chapterOne,stage:'choice',wardenHealth:0},
  campaign:recordMilestone(s.campaign,'warden'),
  message:'El Celador se deshace en polvo. Debajo de la escotilla quedan los originales de la transmisión.'};
}
export function closeChapterOne(s:GameState,decision:ChapterOneDecision):GameState{
 if(s.chapterOne.stage!=='choice'||!['destroy','preserve'].includes(decision))return s;
 const destroyed=decision==='destroy';
 return {...s,chapterOne:{...s.chapterOne,stage:'complete',decision},
  campaign:completeChapter(recordMilestone(s.campaign,'chapterChoice'),'last-stop'),
  health:Math.min(100,s.health+(destroyed?20:0)),
  parts:s.parts+(destroyed?0:2),
  message:destroyed?
   'CAPÍTULO I COMPLETADO · Quemas la señal. +20 salud. Vera te mira como si ya hubieras tomado esta decisión.':
   'CAPÍTULO I COMPLETADO · Conservas la cinta. +2 piezas. En tu voz hay otra persona.'};
}
