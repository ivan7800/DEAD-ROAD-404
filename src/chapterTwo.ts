/** DEAD ROAD 404 · F22: Los que no regresan.
 * A playable diner episode with deterministic puzzles, choices, threat and save-safe rewards.
 * Pure rules, independent from Three.js and the DOM.
 */
import {completeChapter,recordMilestone,startChapter} from './campaign.ts';
import type {GameState} from './state.ts';

export type DinerStage='locked'|'arrival'|'breaker'|'ledger'|'code'|'freezer'|'stalker'|'choice'|'complete';
export type MaraChoice='trust'|'avoid';
export type DinerEnding='broadcast'|'silence';
export interface ChapterTwoProgress{
 stage:DinerStage;codeAttempts:number;stalkerHealth:number;
 mara:MaraChoice|null;ending:DinerEnding|null;legacyFinaleAllowed:boolean;
}
export const DINER_HEALTH=90;
export const DINER_POSITIONS={
 entry:{x:-31,z:23},
 menu:{x:-35,z:21},
 mara:{x:-34,z:23},
 breaker:{x:-36,z:17},
 ledger:{x:-35,z:14},
 keypad:{x:-28,z:17},
 freezer:{x:-29,z:10.7},
 threat:{x:-31,z:12}
} as const;
export const DINER_FREQUENCIES=[1977,1984,1992,4040] as const;
const stages:DinerStage[]=['locked','arrival','breaker','ledger','code','freezer','stalker','choice','complete'];
export const freshChapterTwo=():ChapterTwoProgress=>({
 stage:'locked',codeAttempts:0,stalkerHealth:DINER_HEALTH,mara:null,ending:null,legacyFinaleAllowed:false
});
/** Legacy F21 games keep the old 120-km finale without automatically completing chapter II. */
export function normalizeChapterTwo(value:unknown,legacyFinaleAllowed=false):ChapterTwoProgress{
 if(!value||typeof value!=='object')return {...freshChapterTwo(),legacyFinaleAllowed};
 const v=value as Partial<ChapterTwoProgress>;
 const stage=stages.includes(v.stage as DinerStage)?v.stage as DinerStage:'locked';
 const health=typeof v.stalkerHealth==='number'&&Number.isFinite(v.stalkerHealth)?
  Math.max(0,Math.min(DINER_HEALTH,Math.floor(v.stalkerHealth))):DINER_HEALTH;
 const effectiveStage=stage==='stalker'&&health===0?'choice':stage;
 return {
  stage:effectiveStage,
  codeAttempts:typeof v.codeAttempts==='number'&&Number.isFinite(v.codeAttempts)?Math.max(0,Math.min(999,Math.floor(v.codeAttempts))):0,
  stalkerHealth:effectiveStage==='choice'||effectiveStage==='complete'?0:health,
  mara:v.mara==='trust'||v.mara==='avoid'?v.mara:null,
  ending:effectiveStage==='complete'&&(v.ending==='broadcast'||v.ending==='silence')?v.ending:null,
  legacyFinaleAllowed:v.legacyFinaleAllowed===true
 };
}
export function nearDinerProp(x:number,z:number,position:{x:number;z:number},radius=2.2):boolean{
 return Number.isFinite(x)&&Number.isFinite(z)&&Math.hypot(x-position.x,z-position.z)<radius;
}
export function dinerAvailable(s:GameState):boolean{
 return s.ending===null&&s.campaign.completed.includes('last-stop')&&s.km>=24;
}
export function beginDiner(s:GameState):GameState{
 if(!dinerAvailable(s))return {...s,message:'El restaurante aparece después del primer capítulo y 24 km de carretera.'};
 if(s.chapterTwo.stage==='complete')return {...s,message:'La mesa del fondo sigue esperando, pero la historia del restaurante ya ha terminado.'};
 if(s.chapterTwo.stage!=='locked')return {...s,campaign:startChapter(s.campaign,'missing')};
 return {
  ...s,chapterTwo:{...s.chapterTwo,stage:'arrival'},
  campaign:recordMilestone(startChapter(s.campaign,'missing'),'diner'),
  message:'CAPÍTULO II · THE LAST LIGHT. Nadie atiende el restaurante, pero hay un pedido escrito con tu nombre.'
 };
}
export function dinerObjective(s:GameState):string{
 const stage=s.chapterTwo.stage;
 if(stage==='locked'){
  if(s.campaign.completed.includes('last-stop')&&!s.ending)return s.km<24?
   'CAPÍTULO II · Conduce hasta el KM 24 para encontrar THE LAST LIGHT.':
   'CAPÍTULO II · Entra en THE LAST LIGHT desde el mapa.';
  return '';
 }
 switch(stage){
  case 'arrival':return 'CAPÍTULO II · Encuentra el ticket de la mesa junto a la ventana [E]';
  case 'breaker':return 'CAPÍTULO II · Activa el interruptor de neón del restaurante [E]';
  case 'ledger':return 'CAPÍTULO II · Examina el libro de huéspedes de la barra [E]';
  case 'code':return 'CAPÍTULO II · Abre la puerta de la cocina con el año del ticket [E]';
  case 'freezer':return 'CAPÍTULO II · Abre el congelador del fondo [E]';
  case 'stalker':return 'CAPÍTULO II · LA CAMARERA HUECA · [F] atacar · [SHIFT] correr · [I] curarse';
  case 'choice':return 'CAPÍTULO II · Decide el destino de la grabación del restaurante';
  case 'complete':return 'CAPÍTULO II COMPLETADO · El pueblo sin nombre sigue al otro lado del desierto';
 }
}
export function chooseMara(s:GameState,choice:MaraChoice):GameState{
 if(s.chapterTwo.stage==='locked'||s.chapterTwo.stage==='complete'||s.chapterTwo.mara!==null)return s;
 if(choice!=='trust'&&choice!=='avoid')return s;
 return {...s,chapterTwo:{...s.chapterTwo,mara:choice},
  campaign:recordMilestone(s.campaign,'mara'),
  food:choice==='trust'?Math.min(999,s.food+2):s.food,
  message:choice==='trust'?
   'MARA: «Yo serví la última cena aquí, en 1992». Te entrega dos raciones y señala una mesa vacía.':
   'MARA: «Desconfiarás de mí hasta que recuerdes quién apagó las luces». La silueta se disuelve.'};
}
export function readDinerTicket(s:GameState):GameState{
 if(s.chapterTwo.stage!=='arrival')return s;
 return {...s,chapterTwo:{...s.chapterTwo,stage:'breaker'},
  campaign:recordMilestone(s.campaign,'dinerTicket'),
  message:'PEDIDO SIN CLIENTE: MESA 4 · 19 OCT 1992. En la servilleta: «NO SE MARCHÓ NADIE». Busca el interruptor de neón.'};
}
export function restoreDinerNeon(s:GameState):GameState{
 if(s.chapterTwo.stage!=='breaker')return s;
 return {...s,chapterTwo:{...s.chapterTwo,stage:'ledger'},
  campaign:recordMilestone(s.campaign,'neon'),
  message:'El letrero THE LAST LIGHT se enciende. En la barra aparece un libro de huéspedes que estaba vacío.'};
}
export function readDinerLedger(s:GameState):GameState{
 if(s.chapterTwo.stage!=='ledger')return s;
 return {...s,chapterTwo:{...s.chapterTwo,stage:'code'},
  campaign:recordMilestone(s.campaign,'ledger'),
  message:'LIBRO DE HUÉSPEDES: seis nombres tachados, el último el tuyo. La cerradura de la cocina pide el AÑO DEL TICKET.'};
}
export function tryDinerCode(s:GameState,code:number):GameState{
 if(s.chapterTwo.stage!=='code')return s;
 if(code!==1992)return {...s,chapterTwo:{...s.chapterTwo,codeAttempts:Math.min(999,s.chapterTwo.codeAttempts+1)},
  message:'CÓDIGO '+code+' INCORRECTO. El contador parpadea. Recuerda la fecha del pedido de la mesa cuatro.'};
 return {...s,chapterTwo:{...s.chapterTwo,stage:'freezer'},
  campaign:recordMilestone(s.campaign,'dinerKitchen'),
  message:'1992. Se abre la cocina. Al fondo, un congelador golpea desde dentro.'};
}
export function openDinerFreezer(s:GameState):GameState{
 if(s.chapterTwo.stage!=='freezer')return s;
 return {...s,chapterTwo:{...s.chapterTwo,stage:'stalker',stalkerHealth:DINER_HEALTH},
  campaign:recordMilestone(s.campaign,'dinerFreezer'),
  message:'El congelador se abre desde dentro. Una camarera sin rostro repite tu pedido. ¡DEFÍENDETE!'};
}
export function defeatDinerThreat(s:GameState):GameState{
 if(s.chapterTwo.stage!=='stalker'||s.chapterTwo.stalkerHealth>0)return s;
 return {...s,chapterTwo:{...s.chapterTwo,stage:'choice',stalkerHealth:0},
  campaign:recordMilestone(s.campaign,'dinerThreat'),
  message:'La Camarera Hueca se desploma. En su delantal hay una cinta marcada «LOS QUE NO REGRESAN».'};
}
export function concludeDiner(s:GameState,choice:DinerEnding):GameState{
 if(s.chapterTwo.stage!=='choice'||!['broadcast','silence'].includes(choice))return s;
 const broadcast=choice==='broadcast';
 return {...s,chapterTwo:{...s.chapterTwo,stage:'complete',ending:choice},
  campaign:completeChapter(recordMilestone(s.campaign,'dinerDecision'),'missing'),
  fuel:broadcast?Math.min(80,s.fuel+10):s.fuel,
  parts:s.parts+(broadcast?0:2),
  message:broadcast?
   'CAPÍTULO II COMPLETADO · Transmites las voces de los desaparecidos. +10 L de gasolina. Algo contesta desde el pueblo sin nombre.':
   'CAPÍTULO II COMPLETADO · Entierras la cinta bajo la máquina de café. +2 piezas. Las voces callan... por ahora.'};
}
