/** DEAD ROAD 404 · Fase 25 — Frecuencia muerta.
 * Pure progression rules, original dialogue, two related signal ciphers and bunker combat.
 * No DOM, renderer or storage coupling; deterministic save-safe chapter state.
 */
import type {GameState} from './state.ts';
import {completeChapter,recordMilestone,startChapter} from './campaign.ts';
export type RadioStage='locked'|'arrival'|'relay'|'archive'|'tuning'|'hatch'|'bunker'|'breaker'|'sentinel'|'choice'|'complete';
export type NoraChoice='help'|'refuse';
export type RadioDecision='broadcast'|'sever';
export interface ChapterFourProgress{
 stage:RadioStage;nora:NoraChoice|null;
 attempts:number;subcodeAttempts:number;breakersMask:number;
 operatorHealth:number;cacheTaken:boolean;decision:RadioDecision|null;legacyFinaleAllowed:boolean;
}
export const RADIO_OPERATOR_HEALTH=150;
export const RADIO_POSITIONS={
 entry:{x:-22,z:-29},nora:{x:-19,z:-32},supplies:{x:-16,z:-33},
 sign:{x:-22,z:-35},relay:{x:-22,z:-38},archive:{x:-22,z:-43},
 mixer:{x:-22,z:-48},hatch:{x:-22,z:-54},
 undergroundEntry:{x:-22,z:32},exit:{x:-22,z:32},console:{x:-22,z:36.3},
 breakerA:{x:-25.6,z:39.2},breakerB:{x:-18.4,z:39.2},
 operator:{x:-22,z:42}
} as const;
export const RADIO_STUDIO_CODES=['0217','0313','0404','1992'] as const;
export const RADIO_BUNKER_CODES=['0000','0217','0313','4040'] as const;
const stages:RadioStage[]=['locked','arrival','relay','archive','tuning','hatch','bunker','breaker','sentinel','choice','complete'];
export const freshChapterFour=():ChapterFourProgress=>({
 stage:'locked',nora:null,attempts:0,subcodeAttempts:0,breakersMask:0,
 operatorHealth:RADIO_OPERATOR_HEALTH,cacheTaken:false,decision:null,legacyFinaleAllowed:false
});
export function normalizeChapterFour(value:unknown,legacyFinaleAllowed=false):ChapterFourProgress{
 if(!value||typeof value!=='object')return {...freshChapterFour(),legacyFinaleAllowed};
 const p=value as Partial<ChapterFourProgress>;
 const stage=stages.includes(p.stage as RadioStage)?p.stage as RadioStage:'locked';
 if(stage==='locked')return {...freshChapterFour(),legacyFinaleAllowed:p.legacyFinaleAllowed===true};
 const health=typeof p.operatorHealth==='number'&&Number.isFinite(p.operatorHealth)?
  Math.max(0,Math.min(RADIO_OPERATOR_HEALTH,Math.floor(p.operatorHealth))):RADIO_OPERATOR_HEALTH;
 const mask=typeof p.breakersMask==='number'&&Number.isInteger(p.breakersMask)&&p.breakersMask>=0&&p.breakersMask<=3?p.breakersMask:0;
 const normalizedStage=stage==='sentinel'&&health===0?'choice':stage;
 return {
  stage:normalizedStage,
  nora:p.nora==='help'||p.nora==='refuse'?p.nora:null,
  attempts:Number.isFinite(p.attempts)?Math.max(0,Math.min(999,Math.trunc(p.attempts!))):0,
  subcodeAttempts:Number.isFinite(p.subcodeAttempts)?Math.max(0,Math.min(999,Math.trunc(p.subcodeAttempts!))):0,
  breakersMask:normalizedStage==='sentinel'||normalizedStage==='choice'||normalizedStage==='complete'?3:mask,
  operatorHealth:normalizedStage==='choice'||normalizedStage==='complete'?0:health,
  cacheTaken:p.cacheTaken===true,
  decision:normalizedStage==='complete'&&(p.decision==='broadcast'||p.decision==='sever')?p.decision:null,
  legacyFinaleAllowed:p.legacyFinaleAllowed===true
 };
}
export function nearRadioProp(x:number,z:number,pos:{x:number;z:number},radius=2.25):boolean{
 return Number.isFinite(x)&&Number.isFinite(z)&&Math.hypot(pos.x-x,pos.z-z)<radius;
}
export function canEnterRadio(s:GameState):boolean{
 return s.ending===null&&s.km>=72&&s.chapterThree.stage==='complete'&&
  s.campaign.completed.includes('nameless');
}
export function beginRadio(s:GameState):GameState{
 if(!canEnterRadio(s))return {...s,message:'Necesitas terminar el pueblo sin nombre y alcanzar el KM 72.'};
 if(s.chapterFour.stage==='complete')return s;
 if(s.chapterFour.stage!=='locked')return {...s,campaign:startChapter(s.campaign,'dead-frequency')};
 return {...s,chapterFour:{...s.chapterFour,stage:'arrival'},
  campaign:recordMilestone(startChapter(s.campaign,'dead-frequency'),'radioArrival'),
  message:'CAPÍTULO IV · FRECUENCIA MUERTA. WXR-404, una emisora sin licencia. La antena apunta hacia abajo, como si el público estuviera enterrado.'};
}
export function radioObjective(s:GameState):string{
 switch(s.chapterFour.stage){
  case 'locked':return s.chapterThree.stage==='complete'&&!s.ending?
   s.km<72?'CAPÍTULO IV · Conduce hasta KM 72 para localizar WXR-404.':
   'CAPÍTULO IV · Entra en la emisora WXR-404 desde el mapa.':'';
  case 'arrival':return 'CAPÍTULO IV · Investiga la señal de entrada de WXR-404 [E]';
  case 'relay':return 'CAPÍTULO IV · Enciende el relé de la antena [E]';
  case 'archive':return 'CAPÍTULO IV · Encuentra la cinta maestra en el estudio [E]';
  case 'tuning':return 'CAPÍTULO IV · Ajusta el mezclador con el código de la frecuencia 02:17 [E]';
  case 'hatch':return 'CAPÍTULO IV · Abre la escotilla del refugio bajo la emisora [E]';
  case 'bunker':return 'CAPÍTULO IV · Descifra el terminal subterráneo con la hora del campanario [E]';
  case 'breaker':return 'CAPÍTULO IV · Desconecta los DOS interruptores de emergencia [E]';
  case 'sentinel':return 'CAPÍTULO IV · EL OPERADOR · [F] golpear · [SHIFT] esquivar · [I] curarse';
  case 'choice':return 'CAPÍTULO IV · Decide el destino de la transmisión de los desaparecidos';
  case 'complete':return '';
 }
}
export function speakNora(s:GameState,choice:NoraChoice):GameState{
 if(s.chapterFour.stage==='locked'||s.chapterFour.stage==='complete'||s.chapterFour.nora!==null)return s;
 if(choice!=='help'&&choice!=='refuse')return s;
 return {...s,chapterFour:{...s.chapterFour,nora:choice},
  campaign:recordMilestone(s.campaign,'radioNora'),
  food:choice==='help'?Math.min(999,s.food+2):s.food,
  parts:choice==='refuse'?Math.min(999,s.parts+1):s.parts,
  message:choice==='help'?
   'NORA, TÉCNICA WXR: «La antena transmite a quienes aún no han nacido». Te entrega 2 raciones. Conserva el código 02:17.':
   'NORA: «Nadie mantiene abierta esta emisora. Se mantiene sola». Deja una pieza sobre el suelo y desaparece.'};
}
export function inspectRadioSign(s:GameState):GameState{
 if(s.chapterFour.stage!=='arrival')return s;
 return {...s,chapterFour:{...s.chapterFour,stage:'relay'},
  campaign:recordMilestone(s.campaign,'radioSign'),
  message:'WXR-404 · NO EMITIR TRAS LAS 02:17. Una placa cita al «PROYECTO UMBRAL / OCT 1992». El relé exterior está sin corriente.'};
}
export function powerRadioRelay(s:GameState):GameState{
 if(s.chapterFour.stage!=='relay')return s;
 return {...s,chapterFour:{...s.chapterFour,stage:'archive'},
  campaign:recordMilestone(s.campaign,'radioRelay'),
  message:'La emisora despierta. Bajo el suelo, una voz anuncia los nombres del pueblo desaparecido en orden alfabético.'};
}
export function readRadioArchive(s:GameState):GameState{
 if(s.chapterFour.stage!=='archive')return s;
 const echo=s.chapterThree.decision==='transmit'?
  ' Tu transmisión desde el pueblo está grabada ANTES de que la realizaras.':
  ' Hay un registro sellado con tu letra; no recuerdas haberlo dejado aquí.';
 return {...s,chapterFour:{...s.chapterFour,stage:'tuning'},
  campaign:recordMilestone(s.campaign,'radioArchive'),
  message:'CINTA MAESTRA U-17: «A las 02:17 se abre el canal. A las 03:13 se abre la puerta». '+echo};
}
export function tuneRadioMixer(s:GameState,code:string):GameState{
 if(s.chapterFour.stage!=='tuning')return s;
 if(code!=='0217')return {...s,chapterFour:{...s.chapterFour,attempts:Math.min(999,s.chapterFour.attempts+1)},
  message:'WXR-404 · CÓDIGO '+code+' INVÁLIDO. La cinta repite: «A las 02:17 se abre el canal».'};
 return {...s,chapterFour:{...s.chapterFour,stage:'hatch'},
  campaign:recordMilestone(s.campaign,'radioTuned'),
  message:'02:17 · El canal se abre, pero la antena recibe una señal desde el subsuelo. Una escotilla vibra detrás del estudio.'};
}
export function openRadioBunker(s:GameState):GameState{
 if(s.chapterFour.stage!=='hatch')return s;
 return {...s,chapterFour:{...s.chapterFour,stage:'bunker'},
  campaign:recordMilestone(s.campaign,'radioBunker'),
  message:'DESCENSO AL REFUGIO UMBRAL. Sin ventanas y sin relojes, se oyen trece golpes detrás de la pared.'};
}
export function decodeRadioBunker(s:GameState,code:string):GameState{
 if(s.chapterFour.stage!=='bunker')return s;
 if(code!=='0313')return {...s,chapterFour:{...s.chapterFour,subcodeAttempts:Math.min(999,s.chapterFour.subcodeAttempts+1)},
  message:'TERMINAL UMBRAL · '+code+' NO RECONOCIDO. El campanario marcaba las 03:13.'};
 return {...s,chapterFour:{...s.chapterFour,stage:'breaker'},
  campaign:recordMilestone(s.campaign,'radioDecoded'),
  message:'UMB-0313 · La sala de contención se desbloquea. DOS interruptores alimentan a lo que sigue hablando en la radio.'};
}
export function disableRadioBreaker(s:GameState,id:'A'|'B'):GameState{
 if(s.chapterFour.stage!=='breaker')return s;
 const bit=id==='A'?1:id==='B'?2:0;
 if(!bit||(s.chapterFour.breakersMask&bit)!==0)return s;
 const breakersMask=s.chapterFour.breakersMask|bit,ready=breakersMask===3;
 return {...s,chapterFour:{...s.chapterFour,breakersMask,stage:ready?'sentinel':'breaker',operatorHealth:RADIO_OPERATOR_HEALTH},
  campaign:recordMilestone(s.campaign,ready?'radioContainment':'radioBreaker'),
  message:ready?'LAS DOS FUENTES SE APAGAN. La voz pierde su escudo y surge EL OPERADOR: «No cortéis la emisión».':
  'INTERRUPTOR '+id+' DESCONECTADO. La radio cruje; falta desactivar una fuente.'};
}
export function defeatRadioOperator(s:GameState):GameState{
 if(s.chapterFour.stage!=='sentinel'||s.chapterFour.operatorHealth>0)return s;
 return {...s,chapterFour:{...s.chapterFour,stage:'choice',operatorHealth:0},
  campaign:recordMilestone(s.campaign,'radioOperator'),
  message:'EL OPERADOR SE DESHACE EN INTERFERENCIAS. Su voz sigue en todos los altavoces. Falta decidir si el mundo debe escucharla.'};
}
export function takeRadioSupplies(s:GameState):GameState{
 if(s.chapterFour.stage==='locked'||s.chapterFour.cacheTaken)return s;
 return {...s,chapterFour:{...s.chapterFour,cacheTaken:true},
  campaign:recordMilestone(s.campaign,'radioSupplies'),
  health:Math.min(100,s.health+22),parts:Math.min(999,s.parts+1),
  message:'BOTIQUÍN WXR: +22 SALUD · +1 PIEZA. Una etiqueta dice: «USAR ANTES DEL FIN DE LA EMISIÓN».'};
}
export function concludeRadio(s:GameState,decision:RadioDecision):GameState{
 if(s.chapterFour.stage!=='choice'||(decision!=='broadcast'&&decision!=='sever'))return s;
 return {...s,chapterFour:{...s.chapterFour,stage:'complete',decision},
  campaign:completeChapter(recordMilestone(s.campaign,'radioDecision'),'dead-frequency'),
  fuel:decision==='broadcast'?Math.min(80,s.fuel+14):s.fuel,
  parts:decision==='sever'?Math.min(999,s.parts+2):s.parts,
  message:decision==='broadcast'?
   'CAPÍTULO IV COMPLETADO · EMITES LOS NOMBRES POR WXR-404. +14 L. El desierto devuelve la señal con tu voz envejecida.':
   'CAPÍTULO IV COMPLETADO · CORTAS LA EMISIÓN. +2 PIEZAS. Al otro lado de la escotilla siguen oyéndose voces.'};
}
