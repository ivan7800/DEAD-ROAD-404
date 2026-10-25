/** F26 — KM 96: El kilómetro imposible. Pure, save-compatible chapter logic. */
import type {GameState} from './state.ts';
import {completeChapter,recordMilestone,startChapter} from './campaign.ts';

export type MileStage='locked'|'arrival'|'log'|'beacons'|'dial'|'hunter'|'choice'|'complete';
export type MileDecision='remember'|'forget';
export interface ChapterFiveProgress {
 stage:MileStage;beaconsMask:number;dialAttempts:number;hunterHealth:number;
 cacheTaken:boolean;decision:MileDecision|null;legacyFinaleAllowed:boolean;
}
export const MILE_HUNTER_HEALTH=120;
export const MILE_POSITIONS={
 entry:{x:0,z:0},sign:{x:0,z:-12},log:{x:0,z:-21},
 beaconA:{x:-6,z:-31},beaconB:{x:6,z:-31},dial:{x:0,z:-42},
 hunter:{x:0,z:-54},supplies:{x:7,z:-19}
} as const;
export const MILE_CODES=['0404','2496','0217','0313'] as const;
const stages:ReadonlyArray<MileStage>=['locked','arrival','log','beacons','dial','hunter','choice','complete'];
export const freshChapterFive=():ChapterFiveProgress=>({
 stage:'locked',beaconsMask:0,dialAttempts:0,hunterHealth:MILE_HUNTER_HEALTH,
 cacheTaken:false,decision:null,legacyFinaleAllowed:false
});
export function normalizeChapterFive(value:unknown,legacyFinaleAllowed=false):ChapterFiveProgress {
 if(!value||typeof value!=='object'||Array.isArray(value))
  return {...freshChapterFive(),legacyFinaleAllowed};
 const p=value as Partial<ChapterFiveProgress>;
 const stage=stages.includes(p.stage as MileStage)?p.stage as MileStage:'locked';
 if(stage==='locked')return {...freshChapterFive(),legacyFinaleAllowed:p.legacyFinaleAllowed===true};
 const mask=Number.isInteger(p.beaconsMask)&&p.beaconsMask!>=0&&p.beaconsMask!<=3?p.beaconsMask!:0;
 const health=typeof p.hunterHealth==='number'&&Number.isFinite(p.hunterHealth)?
  Math.max(0,Math.min(MILE_HUNTER_HEALTH,Math.floor(p.hunterHealth))):MILE_HUNTER_HEALTH;
 const normalizedStage=stage==='hunter'&&health===0?'choice':stage;
 return {
  stage:normalizedStage,
  beaconsMask:['dial','hunter','choice','complete'].includes(normalizedStage)?3:
   normalizedStage==='beacons'?mask:0,
  dialAttempts:typeof p.dialAttempts==='number'&&Number.isFinite(p.dialAttempts)?
   Math.max(0,Math.min(999,Math.trunc(p.dialAttempts))):0,
  hunterHealth:['choice','complete'].includes(normalizedStage)?0:health,
  cacheTaken:p.cacheTaken===true,
  decision:normalizedStage==='complete'&&(p.decision==='remember'||p.decision==='forget')?p.decision:null,
  legacyFinaleAllowed:p.legacyFinaleAllowed===true
 };
}
export const nearMile=(x:number,z:number,p:{x:number;z:number},radius=2.4):boolean=>
 Number.isFinite(x)&&Number.isFinite(z)&&Math.hypot(p.x-x,p.z-z)<radius;
export function canEnterMile(s:GameState):boolean {
 return s.ending===null&&s.km>=96&&s.chapterFour.stage==='complete'&&
  s.campaign.completed.includes('dead-frequency');
}
export function beginMile(s:GameState):GameState {
 if(!canEnterMile(s))return {...s,message:'Completa FRECUENCIA MUERTA y alcanza el KM 96.'};
 if(s.chapterFive.stage==='complete')return s;
 if(s.chapterFive.stage!=='locked')return {...s,campaign:startChapter(s.campaign,'impossible-mile')};
 return {...s,chapterFive:{...s.chapterFive,stage:'arrival'},
  campaign:recordMilestone(startChapter(s.campaign,'impossible-mile'),'mileArrival'),
  message:'CAPÍTULO V · EL KILÓMETRO IMPOSIBLE. Tres señales indican KM 96. El odómetro insiste en que has pasado por aquí mañana.'};
}
export function mileObjective(s:GameState):string {
 switch(s.chapterFive.stage){
  case 'locked':return s.chapterFour.stage==='complete'&&!s.ending?
   (s.km<96?'CAPÍTULO V · Conduce hasta el KM 96.':'CAPÍTULO V · Entra en EL KILÓMETRO IMPOSIBLE desde el mapa.'):'';
  case 'arrival':return 'CAPÍTULO V · Lee el poste kilométrico repetido [E]';
  case 'log':return 'CAPÍTULO V · Revisa el registrador de la patrulla [E]';
  case 'beacons':return 'CAPÍTULO V · Activa las DOS balizas de distancia [E]';
  case 'dial':return 'CAPÍTULO V · Introduce la combinación de los tramos 72 → 96 [E]';
  case 'hunter':return 'CAPÍTULO V · EL AGRIMENSOR · [F] golpear · [SHIFT] esquivar · [I] curarse';
  case 'choice':return 'CAPÍTULO V · Decide qué recuerdo dejarás en el arcén';
  case 'complete':return '';
 }
}
export function inspectMileSign(s:GameState):GameState {
 if(s.chapterFive.stage!=='arrival')return s;
 return {...s,chapterFive:{...s.chapterFive,stage:'log'},
  campaign:recordMilestone(s.campaign,'mileSign'),
  message:'KM 96 / KM 96 / KM 96. Tres flechas apuntan al mismo lugar. Bajo la última hay una frase: «Solo ha sucedido veinticuatro kilómetros después».'};
}
export function inspectMileLog(s:GameState):GameState {
 if(s.chapterFive.stage!=='log')return s;
 const transmission=s.chapterFour.decision==='broadcast'?
  'La voz de Nora recita un nombre que no estaba en su lista.':
  'Una cinta reproduce el clic exacto con que cortaste la emisión.';
 return {...s,chapterFive:{...s.chapterFive,stage:'beacons'},
  campaign:recordMilestone(s.campaign,'mileLog'),
  message:'REGISTRADOR DE PATRULLA: «KM 72 → KM 96: 24. El espejo devuelve 96». '+transmission+' Activa las dos balizas para estabilizar el paisaje.'};
}
export function activateMileBeacon(s:GameState,id:'A'|'B'):GameState {
 if(s.chapterFive.stage!=='beacons')return s;
 const bit=id==='A'?1:id==='B'?2:0;
 if((s.chapterFive.beaconsMask&bit)!==0)return s;
 const mask=s.chapterFive.beaconsMask|bit;
 return {...s,chapterFive:{...s.chapterFive,beaconsMask:mask,stage:mask===3?'dial':'beacons'},
  campaign:recordMilestone(s.campaign,mask===3?'mileBothBeacons':'mileBeacon'),
  message:mask===3?'LAS DOS BALIZAS RESPONDEN. El marcador central muestra «24 / 96» y el horizonte se inmoviliza.':
   'BALIZA '+id+' ACTIVADA. El asfalto se ondula bajo tus pies. Falta una señal.'};
}
export function tuneMileDial(s:GameState,code:string):GameState {
 if(s.chapterFive.stage!=='dial')return s;
 if(code!=='2496')return {...s,chapterFive:{...s.chapterFive,dialAttempts:Math.min(999,s.chapterFive.dialAttempts+1)},
  message:'COMBINACIÓN INCORRECTA · KM 96 menos KM 72 son 24. La placa muestra 24 / 96.'};
 return {...s,chapterFive:{...s.chapterFive,stage:'hunter',hunterHealth:MILE_HUNTER_HEALTH},
  campaign:recordMilestone(s.campaign,'mileDial'),
  message:'24 / 96. El desierto recupera profundidad. Del otro lado de la barrera sale EL AGRIMENSOR: lleva tu cara dibujada en el mapa.'};
}
export function defeatMileHunter(s:GameState):GameState {
 if(s.chapterFive.stage!=='hunter'||s.chapterFive.hunterHealth>0)return s;
 return {...s,chapterFive:{...s.chapterFive,stage:'choice',hunterHealth:0},
  campaign:recordMilestone(s.campaign,'mileHunter'),
  message:'EL AGRIMENSOR SE DOBLA COMO UN MAPA ANTIGUO. En la tierra queda una carretera dibujada con nombres.'};
}
export function takeMileSupplies(s:GameState):GameState {
 if(s.chapterFive.stage==='locked'||s.chapterFive.stage==='complete'||s.chapterFive.cacheTaken)return s;
 return {...s,chapterFive:{...s.chapterFive,cacheTaken:true},
  health:Math.min(100,s.health+18),food:Math.min(999,s.food+2),
  campaign:recordMilestone(s.campaign,'mileSupplies'),
  message:'MALETA DE PATRULLA: +18 SALUD · +2 COMIDA. La etiqueta lleva una fecha que todavía no ha ocurrido.'};
}
export function concludeMile(s:GameState,decision:MileDecision):GameState {
 if(s.chapterFive.stage!=='choice'||(decision!=='remember'&&decision!=='forget'))return s;
 return {...s,chapterFive:{...s.chapterFive,stage:'complete',decision},
  campaign:completeChapter(recordMilestone(s.campaign,'mileDecision'),'impossible-mile'),
  fuel:decision==='remember'?Math.min(80,s.fuel+12):s.fuel,
  parts:decision==='forget'?Math.min(999,s.parts+3):s.parts,
  message:decision==='remember'?
   'CAPÍTULO V COMPLETADO · CONSERVAS LOS NOMBRES. +12 L. El siguiente cartel anuncia el último desvío, pero reconoces la voz que lo lee.':
   'CAPÍTULO V COMPLETADO · ENTERRASTE EL MAPA. +3 PIEZAS. Algo esencial ha desaparecido de los recuerdos de Vera.'};
}
