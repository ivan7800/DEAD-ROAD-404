/** F27 — Chapter VI, the final road. Pure campaign state; no DOM/rendering. */
import type {GameState} from './state.ts';
import {recordMilestone,startChapter} from './campaign.ts';

export type RoadEndStage='locked'|'arrival'|'ledger'|'relays'|'cipher'|'double'|'choice'|'complete';
export interface ChapterSixProgress {
 stage:RoadEndStage;relaysMask:number;codeAttempts:number;
 doubleHealth:number;suppliesTaken:boolean;legacyFinaleAllowed:boolean;
}
export const ROAD_DOUBLE_HEALTH=140;
export const END_POSITIONS={
 entry:{x:0,z:0},sign:{x:0,z:-10},ledger:{x:0,z:-20},
 relayA:{x:-6,z:-30},relayB:{x:6,z:-30},console:{x:0,z:-42},
 double:{x:0,z:-54},supplies:{x:7,z:-18}
} as const;
export const END_CODES=['0313','0217','1204','4040'] as const;
const stages:ReadonlyArray<RoadEndStage>=['locked','arrival','ledger','relays','cipher','double','choice','complete'];
export const freshChapterSix=():ChapterSixProgress=>({
 stage:'locked',relaysMask:0,codeAttempts:0,doubleHealth:ROAD_DOUBLE_HEALTH,
 suppliesTaken:false,legacyFinaleAllowed:false
});
export function normalizeChapterSix(data:unknown,legacyFinaleAllowed=false):ChapterSixProgress{
 if(!data||typeof data!=='object'||Array.isArray(data))
  return {...freshChapterSix(),legacyFinaleAllowed};
 const v=data as Partial<ChapterSixProgress>;
 const stage=stages.includes(v.stage as RoadEndStage)?v.stage as RoadEndStage:'locked';
 if(stage==='locked')return {...freshChapterSix(),legacyFinaleAllowed:v.legacyFinaleAllowed===true};
 const mask=Number.isInteger(v.relaysMask)&&v.relaysMask!>=0&&v.relaysMask!<=3?v.relaysMask!:0;
 const health=typeof v.doubleHealth==='number'&&Number.isFinite(v.doubleHealth)?
  Math.max(0,Math.min(ROAD_DOUBLE_HEALTH,Math.floor(v.doubleHealth))):ROAD_DOUBLE_HEALTH;
 const effectiveStage=stage==='double'&&health===0?'choice':stage;
 return {stage:effectiveStage,
  relaysMask:['cipher','double','choice','complete'].includes(effectiveStage)?3:effectiveStage==='relays'?mask:0,
  codeAttempts:typeof v.codeAttempts==='number'&&Number.isFinite(v.codeAttempts)?
   Math.max(0,Math.min(999,Math.trunc(v.codeAttempts))):0,
  doubleHealth:['choice','complete'].includes(effectiveStage)?0:health,
  suppliesTaken:v.suppliesTaken===true,legacyFinaleAllowed:v.legacyFinaleAllowed===true
 };
}
export const nearRoadEnd=(x:number,z:number,p:{x:number;z:number},radius=2.5)=>
 Number.isFinite(x)&&Number.isFinite(z)&&Math.hypot(x-p.x,z-p.z)<radius;
export function canEnterRoadEnd(s:GameState):boolean{
 return s.ending===null&&s.km>=120&&s.mission.stage==='resolved'&&
  s.chapterFive.stage==='complete'&&s.campaign.completed.includes('impossible-mile');
}
export function beginRoadEnd(s:GameState):GameState{
 if(!canEnterRoadEnd(s))return {...s,message:'Completa EL KILÓMETRO IMPOSIBLE y alcanza el KM 120.'};
 if(s.chapterSix.stage==='complete')return s;
 if(s.chapterSix.stage!=='locked')return {...s,campaign:startChapter(s.campaign,'road-end')};
 return {...s,chapterSix:{...s.chapterSix,stage:'arrival'},
  campaign:recordMilestone(startChapter(s.campaign,'road-end'),'endArrival'),
  message:'CAPÍTULO VI · DONDE TERMINA LA CARRETERA. Dos salidas llevan a la misma noche. Una tercera aparece en tu retrovisor.'};
}
export function endObjective(s:GameState):string{
 switch(s.chapterSix.stage){
  case 'locked':return s.chapterFive.stage==='complete'&&!s.ending?
   s.km<120?'CAPÍTULO VI · Avanza hasta KM 120.':'CAPÍTULO VI · Entra en EL ÚLTIMO DESVÍO desde el mapa.':'';
  case 'arrival':return 'CAPÍTULO VI · Lee la última señal de la Carretera 404 [E]';
  case 'ledger':return 'CAPÍTULO VI · Recupera el registro de peajes de 1992 [E]';
  case 'relays':return 'CAPÍTULO VI · Activa los DOS relés del desvío [E]';
  case 'cipher':return 'CAPÍTULO VI · Abre la barrera: KM 120 / CARRETERA 404 [E]';
  case 'double':return 'CAPÍTULO VI · EL DOBLE · [F] golpear · [SHIFT] esquivar · [I] curarse';
  case 'choice':return 'CAPÍTULO VI · Elige tu destino ante la última barrera';
  case 'complete':return '';
 }
}
export function readEndSign(s:GameState):GameState{
 if(s.chapterSix.stage!=='arrival')return s;
 return {...s,chapterSix:{...s.chapterSix,stage:'ledger'},
  campaign:recordMilestone(s.campaign,'endSign'),
  message:'KM 120. CARRETERA 404. El cartel lleva una anotación: «El final tiene cuatro cifras: tres del kilometraje y la primera del número de carretera».'};
}
export function readEndLedger(s:GameState):GameState{
 if(s.chapterSix.stage!=='ledger')return s;
 const radio=s.chapterFour.decision==='broadcast'?'Nora está entre las voces que cantan.':'En la radio no hay música: solo nombres archivados.';
 const map=s.chapterFive.decision==='remember'?'El mapa del Agrimensor guarda las caras de los desaparecidos.':'El lugar donde enterraste el mapa sigue manchando tus manos.';
 return {...s,chapterSix:{...s.chapterSix,stage:'relays'},
  campaign:recordMilestone(s.campaign,'endLedger'),
  message:'REGISTRO 1992 · «Ninguna salida es gratuita». '+radio+' '+map+' Enciende ambos relés para liberar la barrera.'};
}
export function enableEndRelay(s:GameState,id:'A'|'B'):GameState{
 if(s.chapterSix.stage!=='relays')return s;
 const bit=id==='A'?1:2;
 if(s.chapterSix.relaysMask&bit)return s;
 const mask=s.chapterSix.relaysMask|bit;
 return {...s,chapterSix:{...s.chapterSix,relaysMask:mask,stage:mask===3?'cipher':'relays'},
  campaign:recordMilestone(s.campaign,mask===3?'endRelays':'endRelay'),
  message:mask===3?'AMBOS RELÉS RESPONDEN. La barrera vuelve a tener materia. Introduce la clave de cuatro cifras.':
   'RELÉ '+id+' ACTIVADO. Oyes el Firebird arrancar detrás de un muro. Falta una conexión.'};
}
export function enterEndCode(s:GameState,code:string):GameState{
 if(s.chapterSix.stage!=='cipher')return s;
 if(code!=='1204')return {...s,chapterSix:{...s.chapterSix,codeAttempts:Math.min(999,s.chapterSix.codeAttempts+1)},
  message:'CÓDIGO INCORRECTO. Cartel: KM 120 / CARRETERA 404 → 120 + 4.'};
 return {...s,chapterSix:{...s.chapterSix,stage:'double',doubleHealth:ROAD_DOUBLE_HEALTH},
  campaign:recordMilestone(s.campaign,'endCode'),
  message:'1204 · BARRERA LIBERADA. Al otro lado aguarda el conductor que te precedió por la misma carretera. LLEVA TU ROSTRO.'};
}
export function defeatRoadDouble(s:GameState):GameState{
 if(s.chapterSix.stage!=='double'||s.chapterSix.doubleHealth>0)return s;
 return {...s,chapterSix:{...s.chapterSix,stage:'choice',doubleHealth:0},
  campaign:recordMilestone(s.campaign,'endDouble'),
  message:'TU DOBLE DEJA CAER LAS LLAVES. Solo una encaja en el Firebird. El asfalto exige tu respuesta definitiva.'};
}
export function takeEndSupplies(s:GameState):GameState{
 if(s.chapterSix.stage==='locked'||s.chapterSix.stage==='complete'||s.chapterSix.suppliesTaken)return s;
 return {...s,chapterSix:{...s.chapterSix,suppliesTaken:true},
  campaign:recordMilestone(s.campaign,'endSupplies'),
  health:Math.min(100,s.health+20),parts:Math.min(999,s.parts+1),
  message:'BOTIQUÍN DE PEAJE: +20 SALUD · +1 PIEZA. Hay una foto tuya en el envoltorio, tomada mañana.'};
}
