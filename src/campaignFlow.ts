import type {GameState} from './state.ts';
import {CHAPTERS} from './campaign.ts';
import {chapterOneObjective} from './chapterOne.ts';
import {dinerObjective} from './chapterTwo.ts';
import {townObjective} from './chapterThree.ts';
import {radioObjective} from './chapterFour.ts';
import {mileObjective} from './chapterFive.ts';
import {endObjective} from './chapterSix.ts';
import {missionObjective} from './mission.ts';
import {roadObjective} from './roadStory.ts';

export function roadHold(s:GameState):string {
 if(s.ending)return 'La historia ha terminado.';
 const chapters=[
  [0,s.chapterOne], [24,s.chapterTwo], [48,s.chapterThree],
  [72,s.chapterFour], [96,s.chapterFive], [120,s.chapterSix]
 ] as const;
 const stop=chapters.find(([km,ch],i)=>s.km===km&&ch.stage!=='complete'&&
  !(i>0&&'legacyFinaleAllowed' in ch&&ch.legacyFinaleAllowed&&ch.stage==='locked'));
 if(!stop)return '';
 const chapter=CHAPTERS[chapters.indexOf(stop)];
 return 'Completa '+chapter.title+' en esta parada antes de continuar.';
}

export const MIN_TRIP_FUEL=8.6;
export function canRecover(s:GameState):boolean {
 return !s.ending&&(s.health===0||s.fuel<MIN_TRIP_FUEL||s.carCondition===0);
}

export function recoverAtFirebird(s:GameState):GameState {
 if(!canRecover(s))return s;
 return {...s,health:s.health===0?35:s.health,
  fuel:s.fuel<MIN_TRIP_FUEL?MIN_TRIP_FUEL:s.fuel,
  carCondition:s.carCondition===0?25:s.carCondition,
  carX:0,carZ:20,
  message:'Recurso de emergencia del Firebird. Puedes reanudar el viaje desde esta parada.'};
}

export function campaignObjective(s:GameState, mode:GameState['mode'], inBunker=false):string {
 if(s.ending)return roadObjective(s);
 if(s.health===0)return mode==='map'?'Usa AUXILIO DEL FIREBIRD o un botiquín de la mochila [I].':
  'Has caído. Vuelve al mapa [M] para pedir auxilio o usa un botiquín [I].';
 if(mode==='map'&&canRecover(s))return 'AUXILIO DEL FIREBIRD disponible si lo necesitas. '+activeObjective(s);
 if(mode==='drive')return 'Conduce hasta el siguiente desvío. [M] mapa · [C] cámara · [L] luces';
 if(mode==='explore'&&s.campaign.current==='dead-frequency'&&!inBunker&&
  ['bunker','breaker','sentinel','choice'].includes(s.chapterFour.stage))return 'CAPÍTULO IV · Baja por la escotilla del estudio al refugio UMBRAL [E]';
 return activeObjective(s);
}

function activeObjective(s:GameState):string {
 return endObjective(s)||mileObjective(s)||radioObjective(s)||townObjective(s)||dinerObjective(s)||
  chapterOneObjective(s)||roadObjective(s)||missionObjective(s.mission);
}
