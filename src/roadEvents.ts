/** Eventos aleatorios de carretera: reglas puras, sin renderer ni DOM, probables con Node. */
import type {GameState} from './state.ts';
// Sin importar valores de state.ts para evitar un ciclo de módulos (state usa freshRoadEvents al cargar).
const MAX_FUEL=80;
const clamp=(n:number,a:number,b:number):number=>Math.min(b,Math.max(a,n));
export type RoadEventId='hitchhiker'|'abandoned-car'|'roadkill'|'shoulder-figure'|'wrong-sign'|'headlights';
export const ROAD_EVENT_IDS:readonly RoadEventId[]=['hitchhiker','abandoned-car','roadkill','shoulder-figure','wrong-sign','headlights'];
/** Estado persistente. Campo opcional en guardados: los antiguos cargan con `freshRoadEvents()`. */
export interface RoadEventsProgress {seen:RoadEventId[];count:number;last:RoadEventId|null}
export const freshRoadEvents=():RoadEventsProgress=>({seen:[],count:0,last:null});
const isId=(v:unknown):v is RoadEventId=>typeof v==='string'&&(ROAD_EVENT_IDS as readonly string[]).includes(v);
export function normalizeRoadEvents(raw:unknown):RoadEventsProgress {
 if(!raw||typeof raw!=='object')return freshRoadEvents();
 const r=raw as Partial<RoadEventsProgress>;
 const seen=Array.isArray(r.seen)?[...new Set(r.seen.filter(isId))]:[];
 const count=typeof r.count==='number'&&Number.isFinite(r.count)?clamp(Math.floor(r.count),0,100000):seen.length;
 return {seen,count,last:isId(r.last)?r.last:null};
}
export interface RoadEventChoice {id:string;label:string}
export interface RoadEventDef {id:RoadEventId;title:string;intro:string;choices:readonly RoadEventChoice[]}
export const ROAD_EVENTS:Readonly<Record<RoadEventId,RoadEventDef>>={
 'hitchhiker':{id:'hitchhiker',title:'EL AUTOESTOPISTA',intro:'Un hombre con mochila levanta el pulgar bajo la lluvia que no cae. La radio susurra: «No recojas a nadie». Lleva la cara medio girada hacia el asfalto.',choices:[{id:'pickup',label:'RECOGERLO'},{id:'ignore',label:'PASAR DE LARGO'}]},
 'abandoned-car':{id:'abandoned-car',title:'EL COCHE ABANDONADO',intro:'Un sedán con las puertas abiertas y los faros encendidos, sin batería. En el asiento hay una chaqueta aún caliente y un termo.',choices:[{id:'search',label:'REGISTRAR EL COCHE'},{id:'siphon',label:'SACAR GASOLINA'},{id:'leave',label:'SEGUIR'}]},
 'roadkill':{id:'roadkill',title:'UN BULTO EN LA CALZADA',intro:'Algo grande yace en mitad del carril. Podría ser un ciervo. El bulto respira a un ritmo que no es de animal.',choices:[{id:'swerve',label:'ESQUIVARLO'},{id:'drive-over',label:'PASAR POR ENCIMA'},{id:'inspect',label:'BAJAR A MIRAR'}]},
 'shoulder-figure':{id:'shoulder-figure',title:'FIGURA EN EL ARCÉN',intro:'Una silueta inmóvil mira el coche desde el arcén. Se ve más alta cada vez que parpadeas.',choices:[{id:'highbeams',label:'LUCES LARGAS'},{id:'honk',label:'TOCAR EL CLAXON'},{id:'floor-it',label:'ACELERAR A FONDO'}]},
 'wrong-sign':{id:'wrong-sign',title:'LA SEÑAL QUE NO DEBERÍA ESTAR',intro:'Una señal verde, recién pintada: «KM 404 — SALIDA A 1 KM». Estás a muchos kilómetros de cualquier 404. Una flecha apunta a un camino de tierra.',choices:[{id:'follow',label:'TOMAR LA SALIDA'},{id:'read-back',label:'LEER EL REVERSO'},{id:'ignore',label:'IGNORARLA'}]},
 'headlights':{id:'headlights',title:'FAROS EN EL RETROVISOR',intro:'Dos faros aparecen detrás, a gran distancia, y se acercan sin ruido de motor. La distancia se acorta aunque vas a fondo.',choices:[{id:'speed-up',label:'ACELERAR'},{id:'pull-over',label:'PARAR Y DEJARLO PASAR'},{id:'lights-off',label:'APAGAR LOS FAROS'}]},
};
/** Probabilidad de que un tramo tenga evento. El primer tramo (km 0) queda limpio como tutorial. */
export const ROAD_EVENT_CHANCE=.7;
export function canRollRoadEvent(s:GameState):boolean {
 return s.km>=24&&s.health>0&&s.ending===null&&s.mode!=='explore';
}
/** `rng` en [0,1). Evita repetir el último evento y favorece los aún no vistos. */
export function pickRoadEvent(s:GameState,rng:()=>number):RoadEventId|null {
 if(!canRollRoadEvent(s))return null;
 if(rng()>=ROAD_EVENT_CHANCE)return null;
 const prev=s.roadEvents.last;
 let pool=ROAD_EVENT_IDS.filter(id=>id!==prev);
 const unseen=pool.filter(id=>!s.roadEvents.seen.includes(id));
 if(unseen.length>0)pool=unseen;
 return pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];
}
export interface RoadEventResult {state:GameState;message:string}
const lose=(v:number,n:number)=>Math.max(0,v-n);
/** Salud mínima 1: un evento de carretera nunca mata, la muerte es cosa de los jefes. */
const hp=(v:number)=>clamp(v,1,100);
/** Resuelve la decisión. `rng` solo se usa en elecciones con riesgo. Devuelve estado nuevo. */
export function resolveRoadEvent(s:GameState,id:RoadEventId,choice:string,rng:()=>number):RoadEventResult {
 const def=ROAD_EVENTS[id];
 if(!def.choices.some(c=>c.id===choice))return {state:s,message:'Esa decisión no existe.'};
 let n={...s};let msg='';
 const roll=rng();
 switch(id+':'+choice){
  case 'hitchhiker:pickup':
   if(roll<.5){n.food=s.food+2;n.health=hp(s.health+5);msg='Viaja callado. Antes de bajar te deja dos raciones y dice: «Gracias por parar». +2 comida, +5 salud.';}
   else{n.health=hp(s.health-10);n.carCondition=clamp(s.carCondition-6,0,100);msg='Al mirar el retrovisor el asiento está vacío y mojado. La tapicería queda destrozada. −10 salud, −6% Firebird.';}
   break;
  case 'hitchhiker:ignore':n.food=lose(s.food,1);msg='En el retrovisor sigue con el pulgar levantado hasta perderse. Notas el estómago vacío: −1 comida.';break;
  case 'abandoned-car:search':
   if(roll<.65){n.parts=s.parts+1;n.food=s.food+1;msg='Entre los asientos hay una pieza útil y una barrita. +1 pieza, +1 comida.';}
   else{n.health=hp(s.health-12);msg='La puerta del maletero se cierra sola sobre tu mano. Dentro no había nada. −12 salud.';}
   break;
  case 'abandoned-car:siphon':n.fuel=clamp(s.fuel+10,0,MAX_FUEL);n.carCondition=clamp(s.carCondition-3,0,100);msg='Chupas gasolina con una manguera vieja. Sabe a metal. +10 L, −3% Firebird por el mal rato.';break;
  case 'abandoned-car:leave':msg='Sigues. Los faros del sedán se apagan justo cuando dejas de verlos.';break;
  case 'roadkill:swerve':n.carCondition=clamp(s.carCondition-8,0,100);msg='Esquivas el bulto y rozas el arcén. −8% Firebird. Algo golpea el techo desde dentro del maletero... o desde fuera.';break;
  case 'roadkill:drive-over':n.carCondition=clamp(s.carCondition-4,0,100);n.health=hp(s.health-6);msg='Un golpe blando. Algo se agarra a los bajos un segundo. −4% Firebird, −6 salud.';break;
  case 'roadkill:inspect':
   if(roll<.5){n.parts=s.parts+1;msg='No era un animal: era un fardo con herramientas atado con cuerda. +1 pieza.';}
   else{n.health=hp(s.health-10);msg='El bulto se gira. No tiene cara. Vuelves al coche tropezando. −10 salud.';}
   break;
  case 'shoulder-figure:highbeams':
   if(roll<.5){msg='La luz la atraviesa y no queda nadie. Solo un poste doblado.';}
   else{n.carCondition=clamp(s.carCondition-10,0,100);msg='Está ya junto a la ventanilla. Un golpe seco en la chapa. −10% Firebird.';}
   break;
  case 'shoulder-figure:honk':n.health=hp(s.health-5);msg='El claxon suena de forma distinta, como un grito conocido. −5 salud.';break;
  case 'shoulder-figure:floor-it':n.fuel=clamp(s.fuel-3,0,MAX_FUEL);msg='Aceleras a fondo y no miras. En el espejo la silueta no se ha movido. −3 L de gasolina.';break;
  case 'wrong-sign:follow':
   if(roll<.4){n.fuel=clamp(s.fuel+8,0,MAX_FUEL);n.parts=s.parts+1;msg='El camino acaba en un coche aparcado con el depósito lleno y una caja de piezas. +8 L, +1 pieza.';}
   else{n.fuel=clamp(s.fuel-6,0,MAX_FUEL);n.health=hp(s.health-8);msg='El camino da vueltas y vuelve a la misma señal. Pierdes tiempo y combustible. −6 L, −8 salud.';}
   break;
  case 'wrong-sign:read-back':n.health=hp(s.health-4);msg='En el reverso, escrito a mano: «ÉL TAMBIÉN LA LEYÓ». −4 salud.';break;
  case 'wrong-sign:ignore':msg='La ignoras. En el retrovisor la señal ya no está.';break;
  case 'headlights:speed-up':n.fuel=clamp(s.fuel-4,0,MAX_FUEL);msg='Aceleras hasta que los faros se desvanecen. −4 L de gasolina.';break;
  case 'headlights:pull-over':
   if(roll<.5){msg='El coche pasa de largo sin conductor y desaparece en la curva.';}
   else{n.health=hp(s.health-8);n.carCondition=clamp(s.carCondition-5,0,100);msg='Se detiene detrás de ti. Nadie baja. Arranca de golpe contra tu parachoques. −8 salud, −5% Firebird.';}
   break;
  case 'headlights:lights-off':
   if(roll<.6){msg='A oscuras, el coche pasa sin verte. Notas su calor en la nuca.';}
   else{n.carCondition=clamp(s.carCondition-12,0,100);msg='Conduces a ciegas y rozas el arcén. −12% Firebird.';}
   break;
 }
 const prev=s.roadEvents;
 n.roadEvents={seen:prev.seen.includes(id)?prev.seen:[...prev.seen,id],count:prev.count+1,last:id};
 n.message=msg;
 return {state:n,message:msg};
}
