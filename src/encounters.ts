import {clamp,type GameState} from './state.ts';
export type EncounterChoice='help'|'trade'|'leave';
export const ENCOUNTER={title:'EL HOMBRE DE LA CHAQUETA AMARILLA',intro:'En el arcén, un hombre hace señales junto a un coche sin ruedas. Sonríe demasiado. «No busco que me lleves. Solo necesito algo de comer», dice. Detrás de él, la radio del Firebird pronuncia tu nombre.',choices:[{id:'help',label:'DARLE 2 RACIONES'},{id:'trade',label:'OFRECER UNA PIEZA'},{id:'leave',label:'ARRANCAR Y MARCHARSE'}]} as const;
export function resolveEncounter(s:GameState,choice:EncounterChoice):GameState {
 if(s.encounterResolved)return {...s,message:'El arcén está vacío. Ya elegiste.'};
 if(choice==='help'){
  if(s.food<2)return {...s,message:'No tienes suficientes raciones.'};
  return {...s,food:s.food-2,health:clamp(s.health+10,0,100),encounterResolved:true,message:'Acepta la comida. «No tomes el desvío cuando veas tres cruces». Recuperas la calma: +10 salud.'};
 }
 if(choice==='trade'){
  if(s.parts<1)return {...s,message:'No tienes piezas que ofrecer.'};
  return {...s,parts:s.parts-1,fuel:clamp(s.fuel+12,0,80),encounterResolved:true,message:'Te entrega gasolina de un bidón sin marca: +12 L. Cuando miras de nuevo, el hombre ya no está.'};
 }
 return {...s,encounterResolved:true,message:'Aceleras sin mirar atrás. En la radio, alguien aplaude despacio.'};
}
export function shouldOfferEncounter(s:GameState):boolean{return s.km>=24&&!s.encounterResolved;}
