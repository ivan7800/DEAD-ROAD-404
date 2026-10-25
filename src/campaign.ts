/** Six-chapter playable campaign; historical epilogue migration remains separate. */
import type {MissionProgress} from './mission.ts';
import type {EndingId} from './roadStory.ts';

export const CHAPTERS=[
 {id:'last-stop',number:'I',title:'LA ÚLTIMA PARADA',setting:'SUNSPUR / MILE 404'},
 {id:'missing',number:'II',title:'LOS QUE NO REGRESAN',setting:'RESTAURANTE DE CARRETERA'},
 {id:'nameless',number:'III',title:'EL PUEBLO SIN NOMBRE',setting:'PUEBLO ABANDONADO'},
 {id:'dead-frequency',number:'IV',title:'FRECUENCIA MUERTA',setting:'ESTACIÓN DE RADIO'},
 {id:'impossible-mile',number:'V',title:'EL KILÓMETRO IMPOSIBLE',setting:'DESIERTO DISTORSIONADO'},
 {id:'road-end',number:'VI',title:'DONDE TERMINA LA CARRETERA',setting:'ÚLTIMO DESVÍO'}
] as const;
export type ChapterId=typeof CHAPTERS[number]['id'];
/** Each new chapter unlocks only when its implementation and QA exist. */
export const PLAYABLE_CHAPTERS:ReadonlySet<ChapterId>=new Set<ChapterId>(['last-stop','missing','nameless','dead-frequency','impossible-mile','road-end']);
export const MILESTONES={
 station:'Entraste en la gasolinera SUNSPUR',
 radio:'Escuchaste la frecuencia 404',
 phone:'Atendiste la cabina telefónica',
 key:'Encontraste la llave 404',
 tape:'Recuperaste la cinta del motel',
 vera:'Decidiste el destino de Vera',
 cache:'Registraste el botiquín de suministros',
 road24:'Sobreviviste al primer tramo de carretera',
 traveller:'Conociste al hombre de la chaqueta amarilla',
 junction:'Elegiste en el último desvío',
 fuse:'Encontraste el fusible del generador SUNSPUR',
 relay:'Restableciste el cuadro eléctrico',
 frequency:'Sintonizaste la frecuencia 217',
 hatch:'Abriste la escotilla del motel MILE 404',
 warden:'Sobreviviste al Celador de la Frecuencia',
 chapterChoice:'Decidiste el destino de la transmisión',
 diner:'Llegaste al restaurante THE LAST LIGHT',
 mara:'Hablaste con Mara, la camarera de 1992',
 dinerTicket:'Encontraste el pedido de la mesa cuatro',
 neon:'Restableciste el neón del restaurante',
 ledger:'Leíste el libro de huéspedes desaparecidos',
 dinerKitchen:'Abriste la puerta de cocina con el código 1992',
 dinerFreezer:'Abriste el congelador del restaurante',
 dinerThreat:'Sobreviviste a la Camarera Hueca',
 dinerDecision:'Decidiste qué hacer con las voces de los desaparecidos',
 townArrival:'Llegaste al pueblo sin nombre',
 townWitness:'Escuchaste a Elías, el testigo del pueblo',
 townMemorial:'Leíste el monumento de los desaparecidos',
 townPower:'Reactivaste el generador del ayuntamiento',
 townArchive:'Descubriste el expediente del pueblo',
 townClock:'Sintonizaste el reloj detenido a las 03:13',
 townChapel:'Abriste la puerta del campanario',
 townGuardian:'Sobreviviste al Campanero',
 townSupplies:'Recuperaste los suministros del ayuntamiento',
 townDecision:'Decidiste el destino del registro de desaparecidos',
 radioArrival:'Llegaste a la emisora abandonada WXR-404',
 radioNora:'Escuchaste a Nora, última técnica de transmisión',
 radioSign:'Encontraste la placa del Proyecto Umbral',
 radioRelay:'Reactivaste el relé exterior de WXR-404',
 radioArchive:'Escuchaste la cinta maestra del estudio',
 radioTuned:'Sintonizaste el mezclador a las 02:17',
 radioBunker:'Descendiste al refugio UMBRAL',
 radioDecoded:'Descifraste el terminal del refugio con 03:13',
 radioBreaker:'Desconectaste el primer circuito de contención',
 radioContainment:'Apagaste ambas fuentes y liberaste al Operador',
 radioOperator:'Sobreviviste al Operador de la Frecuencia Muerta',
 radioSupplies:'Recuperaste el equipo médico de la emisora',
 radioDecision:'Decidiste el destino de la emisión de los desaparecidos',
 mileArrival:'Entraste en el KM 96, un tramo repetido de carretera',
 mileSign:'Leíste las señales de kilometraje imposible',
 mileLog:'Descubriste el registrador de patrulla extraviado',
 mileBeacon:'Activaste una baliza de distancia',
 mileBothBeacons:'Estabilizaste ambas balizas de la carretera',
 mileDial:'Resolviste la distancia entre KM 72 y KM 96',
 mileHunter:'Sobreviviste al Agrimensor',
 mileSupplies:'Recuperaste la maleta de la patrulla',
 mileDecision:'Decidiste qué memoria dejar en el KM 96',
 endArrival:'Llegaste al último desvío, KM 120',
 endSign:'Leíste el cartel que cuenta las cifras del final',
 endLedger:'Recuperaste el registro de peajes de 1992',
 endRelay:'Activaste un relé del desvío',
 endRelays:'Activaste los dos relés de la barrera',
 endCode:'Abriste la última barrera mediante 1204',
 endDouble:'Sobreviviste a tu Doble en la carretera',
 endSupplies:'Recuperaste el botiquín del peaje'
} as const;
export type MilestoneId=keyof typeof MILESTONES;
export interface CampaignProgress {current:ChapterId;completed:ChapterId[];milestones:MilestoneId[]}
export const freshCampaign=():CampaignProgress=>({current:'last-stop',completed:[],milestones:[]});
export function recordMilestone(c:CampaignProgress,id:MilestoneId):CampaignProgress{
 if(c.milestones.includes(id))return c;
 return {...c,milestones:[...c.milestones,id]};
}
export function completeChapter(c:CampaignProgress,id:ChapterId):CampaignProgress{
 if(!PLAYABLE_CHAPTERS.has(id)||c.completed.includes(id))return c;
 return {...c,completed:[...c.completed,id]};
}
export function canStartChapter(c:CampaignProgress,id:ChapterId):boolean{
 const idx=CHAPTERS.findIndex(x=>x.id===id);
 if(idx<0||!PLAYABLE_CHAPTERS.has(id))return false;
 return idx===0||c.completed.includes(CHAPTERS[idx-1].id);
}
export function startChapter(c:CampaignProgress,id:ChapterId):CampaignProgress{
 return canStartChapter(c,id)?{...c,current:id}:c;
}
export function campaignStatus(c:CampaignProgress,id:ChapterId):'completed'|'active'|'locked'|'available'{
 if(c.completed.includes(id))return 'completed';
 if(!canStartChapter(c,id))return 'locked';
 return c.current===id?'active':'available';
}
export interface LegacyCampaignState{
 mission:MissionProgress;ending:EndingId|null;
 visited:boolean;phoneHeard:boolean;motelTape:boolean;
 encounterResolved:boolean;km:number;supplyCacheTaken?:boolean;
}
const ids=CHAPTERS.map(x=>x.id);
const milestones=Object.keys(MILESTONES) as MilestoneId[];
/** Preserve the achievements actually implied by F19 when migrating old saves. */
export function normalizeCampaign(data:unknown,legacy?:LegacyCampaignState):CampaignProgress{
 const v=data&&typeof data==='object'?data as Partial<CampaignProgress>:{};
 const validMilestones=Array.isArray(v.milestones)?
  [...new Set(v.milestones.filter((x):x is MilestoneId=>typeof x==='string'&&milestones.includes(x as MilestoneId)))]:[];
 // Only accept completed chapters in real campaign order. Malformed saves cannot
 // mark chapter II complete before I, or unlock later chapters prematurely.
 const validCompleted:ChapterId[]=[];
 if(Array.isArray(v.completed)){
  for(const raw of v.completed){
   const expected=CHAPTERS[validCompleted.length]?.id;
   if(raw===expected&&PLAYABLE_CHAPTERS.has(raw as ChapterId))validCompleted.push(raw as ChapterId);
  }
 }
 const normalizedCurrent=v.current==='road-end'&&validCompleted.includes('impossible-mile')?'road-end':
  v.current==='impossible-mile'&&validCompleted.includes('dead-frequency')?'impossible-mile':
  v.current==='dead-frequency'&&validCompleted.includes('nameless')?'dead-frequency':
  v.current==='nameless'&&validCompleted.includes('missing')?'nameless':
  v.current==='missing'&&validCompleted.includes('last-stop')?'missing':'last-stop';
 let progress:CampaignProgress={
  current:normalizedCurrent,
  completed:validCompleted,
  milestones:validMilestones
 };
 if(!legacy)return progress;
 if(legacy.visited)progress=recordMilestone(progress,'station');
 if(['signal','key','resolved'].includes(legacy.mission.stage))progress=recordMilestone(progress,'radio');
 if(['key','resolved'].includes(legacy.mission.stage))progress=recordMilestone(progress,'key');
 if(legacy.mission.stage==='resolved')progress=recordMilestone(progress,'vera');
 if(legacy.phoneHeard)progress=recordMilestone(progress,'phone');
 if(legacy.motelTape)progress=recordMilestone(progress,'tape');
 if(legacy.km>=24)progress=recordMilestone(progress,'road24');
 if(legacy.encounterResolved)progress=recordMilestone(progress,'traveller');
 if(legacy.supplyCacheTaken)progress=recordMilestone(progress,'cache');
 if(legacy.ending){progress=recordMilestone(progress,'junction');progress=completeChapter(progress,'last-stop');}
 return progress;
}
