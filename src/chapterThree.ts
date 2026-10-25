/** DEAD ROAD 404 · Fase 23: El pueblo sin nombre.
 * Independent, replayable chapter rules. No renderer/DOM dependencies.
 */
import type {GameState} from './state.ts';
import {completeChapter,recordMilestone,startChapter} from './campaign.ts';

export type TownStage='locked'|'arrival'|'generator'|'archive'|'frequency'|'chapel'|'guardian'|'choice'|'complete';
export type WitnessChoice='believe'|'doubt';
export type TownDecision='transmit'|'seal';
export interface ChapterThreeProgress{
 stage:TownStage;
 witness:WitnessChoice|null;
 attempts:number;
 guardianHealth:number;
 cacheTaken:boolean;
 decision:TownDecision|null;
 legacyFinaleAllowed:boolean;
}
export const TOWN_GUARDIAN_HEALTH=120;
export const TOWN_LOCATIONS={
 entry:{x:12,z:-29},
 witness:{x:10,z:-33},
 memorial:{x:7,z:-36},
 generator:{x:24,z:-38},
 archive:{x:24,z:-45},
 frequency:{x:12,z:-48},
 chapel:{x:12,z:-55},
 guardian:{x:15,z:-57},
 supplies:{x:30,z:-36}
} as const;
export const TOWN_CODES=['0217','0313','0404','1992'] as const;
const stages:TownStage[]=['locked','arrival','generator','archive','frequency','chapel','guardian','choice','complete'];
export const freshChapterThree=():ChapterThreeProgress=>({
 stage:'locked',witness:null,attempts:0,guardianHealth:TOWN_GUARDIAN_HEALTH,
 cacheTaken:false,decision:null,legacyFinaleAllowed:false
});
/** F22 saves missing this field retain their old 120 km ending; no false chapter completion. */
export function normalizeChapterThree(value:unknown,legacyFinaleAllowed=false):ChapterThreeProgress{
 if(!value||typeof value!=='object')return {...freshChapterThree(),legacyFinaleAllowed};
 const p=value as Partial<ChapterThreeProgress>;
 const stage=stages.includes(p.stage as TownStage)?p.stage as TownStage:'locked';
 if(stage==='locked')return {...freshChapterThree(),legacyFinaleAllowed:p.legacyFinaleAllowed===true};
 const h=typeof p.guardianHealth==='number'&&Number.isFinite(p.guardianHealth)?
  Math.max(0,Math.min(TOWN_GUARDIAN_HEALTH,Math.floor(p.guardianHealth))):TOWN_GUARDIAN_HEALTH;
 const effectiveStage=stage==='guardian'&&h===0?'choice':stage;
 return {
  stage:effectiveStage,
  witness:p.witness==='believe'||p.witness==='doubt'?p.witness:null,
  attempts:typeof p.attempts==='number'&&Number.isFinite(p.attempts)?Math.max(0,Math.min(999,Math.floor(p.attempts))):0,
  guardianHealth:effectiveStage==='choice'||effectiveStage==='complete'?0:h,
  cacheTaken:p.cacheTaken===true,
  decision:effectiveStage==='complete'&&(p.decision==='transmit'||p.decision==='seal')?p.decision:null,
  legacyFinaleAllowed:p.legacyFinaleAllowed===true
 };
}
export function nearTownObject(x:number,z:number,target:{x:number;z:number},radius=2.2):boolean{
 return Number.isFinite(x)&&Number.isFinite(z)&&Math.hypot(x-target.x,z-target.z)<radius;
}
export function canEnterTown(s:GameState):boolean{
 return s.ending===null&&s.chapterTwo.stage==='complete'&&
  s.campaign.completed.includes('missing')&&s.km>=48;
}
export function beginTown(s:GameState):GameState{
 if(!canEnterTown(s))return {...s,message:'El pueblo aparece cuando hayas cerrado THE LAST LIGHT y alcanzado el KM 48.'};
 if(s.chapterThree.stage==='complete')return s;
 if(s.chapterThree.stage!=='locked')return {...s,campaign:startChapter(s.campaign,'nameless')};
 return {...s,chapterThree:{...s.chapterThree,stage:'arrival'},
  campaign:recordMilestone(startChapter(s.campaign,'nameless'),'townArrival'),
  message:'CAPÍTULO III · EL PUEBLO SIN NOMBRE. La señal de entrada está vacía. En todas las casas son las 03:13.'};
}
export function townObjective(s:GameState):string{
 switch(s.chapterThree.stage){
  case 'locked':
   return s.chapterTwo.stage==='complete'&&!s.ending?
    s.km<48?'CAPÍTULO III · Avanza hasta KM 48: el pueblo sin nombre.':
    'CAPÍTULO III · Entra en el pueblo sin nombre desde el mapa.':'';
  case 'arrival':return 'CAPÍTULO III · Examina el monumento de los desaparecidos [E]';
  case 'generator':return 'CAPÍTULO III · Enciende el generador junto al ayuntamiento [E]';
  case 'archive':return 'CAPÍTULO III · Busca los registros del archivo municipal [E]';
  case 'frequency':return 'CAPÍTULO III · Introduce la hora congelada del campanario [E]';
  case 'chapel':return 'CAPÍTULO III · Entra al campanario y rompe el silencio [E]';
  case 'guardian':return 'CAPÍTULO III · EL CAMPANERO · [F] atacar · [SHIFT] correr · [I] curarse';
  case 'choice':return 'CAPÍTULO III · Decide qué hacer con el registro de los desaparecidos';
  case 'complete':return '';
 }
}
export function speakWitness(s:GameState,choice:WitnessChoice):GameState{
 if(s.chapterThree.stage==='locked'||s.chapterThree.stage==='complete'||s.chapterThree.witness!==null)return s;
 if(choice!=='believe'&&choice!=='doubt')return s;
 return {...s,chapterThree:{...s.chapterThree,witness:choice},
  campaign:recordMilestone(s.campaign,'townWitness'),
  food:choice==='believe'?Math.min(999,s.food+2):s.food,
  parts:choice==='doubt'?Math.min(999,s.parts+1):s.parts,
  message:choice==='believe'?
   'ELÍAS: «Cada mañana escriben nuestros nombres en la piedra». Te deja dos raciones y huye.':
   'ELÍAS: «Si no crees en este sitio, lleva este hierro». Obtienes una pieza. Sus pies no dejan huellas.'};
}
export function readMemorial(s:GameState):GameState{
 if(s.chapterThree.stage!=='arrival')return s;
 return {...s,chapterThree:{...s.chapterThree,stage:'generator'},
  campaign:recordMilestone(s.campaign,'townMemorial'),
  message:'MONUMENTO: 17 OCT 1992. Una lista de desaparecidos incluye a Mara y a Vera. Bajo el último nombre: 03:13.'};
}
export function restoreTownPower(s:GameState):GameState{
 if(s.chapterThree.stage!=='generator')return s;
 return {...s,chapterThree:{...s.chapterThree,stage:'archive'},
  campaign:recordMilestone(s.campaign,'townPower'),
  message:'El generador arranca. Los relojes del pueblo giran un segundo. El archivo municipal se ilumina.'};
}
export function readTownArchive(s:GameState):GameState{
 if(s.chapterThree.stage!=='archive')return s;
 const consequence=s.chapterTwo.ending==='broadcast'?
  ' Las voces que emitiste desde THE LAST LIGHT se oyen detrás de la pared.':
  ' La cinta enterrada en THE LAST LIGHT aparece aquí, todavía cubierta de café.';
 return {...s,chapterThree:{...s.chapterThree,stage:'frequency'},
  campaign:recordMilestone(s.campaign,'townArchive'),
  message:'ARCHIVO MUNICIPAL: el pueblo desapareció a las 03:13 del 17 de octubre de 1992.'+consequence};
}
export function enterTownCode(s:GameState,code:string):GameState{
 if(s.chapterThree.stage!=='frequency')return s;
 if(code!=='0313')return {...s,chapterThree:{...s.chapterThree,attempts:Math.min(999,s.chapterThree.attempts+1)},
  message:'CÓDIGO '+code+' INCORRECTO. El panel vuelve a mostrar los relojes detenidos: 03:13.'};
 return {...s,chapterThree:{...s.chapterThree,stage:'chapel'},
  campaign:recordMilestone(s.campaign,'townClock'),
  message:'03:13. El campanario responde con trece golpes. Su puerta se abre hacia dentro.'};
}
export function openTownChapel(s:GameState):GameState{
 if(s.chapterThree.stage!=='chapel')return s;
 return {...s,chapterThree:{...s.chapterThree,stage:'guardian',guardianHealth:TOWN_GUARDIAN_HEALTH},
  campaign:recordMilestone(s.campaign,'townChapel'),
  message:'EL CAMPANERO DESPIERTA. No lleva rostro: las campanas repican dentro de su cabeza.'};
}
export function defeatTownGuardian(s:GameState):GameState{
 if(s.chapterThree.stage!=='guardian'||s.chapterThree.guardianHealth>0)return s;
 return {...s,chapterThree:{...s.chapterThree,stage:'choice',guardianHealth:0},
  campaign:recordMilestone(s.campaign,'townGuardian'),
  message:'El Campanero cae y deja una bobina sellada. Las voces del pueblo esperan tu decisión.'};
}
export function takeTownSupplies(s:GameState):GameState{
 if(s.chapterThree.stage==='locked'||s.chapterThree.cacheTaken)return s;
 return {...s,chapterThree:{...s.chapterThree,cacheTaken:true},
  campaign:recordMilestone(s.campaign,'townSupplies'),
  health:Math.min(100,s.health+20),
  parts:Math.min(999,s.parts+1),
  message:'CAJA MUNICIPAL: +20 salud y +1 pieza. Bajo la tapa, un mensaje: «No hay salida sin memoria».'};
}
export function concludeTown(s:GameState,decision:TownDecision):GameState{
 if(s.chapterThree.stage!=='choice'||!['transmit','seal'].includes(decision))return s;
 const transmit=decision==='transmit';
 return {...s,chapterThree:{...s.chapterThree,stage:'complete',decision},
  campaign:completeChapter(recordMilestone(s.campaign,'townDecision'),'nameless'),
  fuel:transmit?Math.min(80,s.fuel+12):s.fuel,
  health:!transmit?Math.min(100,s.health+25):s.health,
  message:transmit?
   'CAPÍTULO III COMPLETADO · Envías los nombres por radio. +12 L. Una estación lejana responde con tu voz.':
   'CAPÍTULO III COMPLETADO · Sellas el registro. +25 salud. El campanario calla, pero los nombres siguen escritos.'};
}
