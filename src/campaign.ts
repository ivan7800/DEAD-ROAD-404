/** Fase 20: serializable campaign framework. Only Chapter I has playable content.
 * Locked chapters are deliberately NOT advertised as playable until their scenes exist.
 */
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
/** Chapter II onwards remains locked until fully implemented and tested. */
export const PLAYABLE_CHAPTERS:ReadonlySet<ChapterId>=new Set<ChapterId>(['last-stop']);
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
 chapterChoice:'Decidiste el destino de la transmisión'
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
 const validCompleted=Array.isArray(v.completed)?
  [...new Set(v.completed.filter((x):x is ChapterId=>typeof x==='string'&&ids.includes(x as ChapterId)&&PLAYABLE_CHAPTERS.has(x as ChapterId)))]:[];
 let progress:CampaignProgress={
  current:typeof v.current==='string'&&PLAYABLE_CHAPTERS.has(v.current as ChapterId)?v.current as ChapterId:'last-stop',
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
