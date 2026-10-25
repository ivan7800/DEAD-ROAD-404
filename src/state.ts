import {INITIAL_MISSION,normalizeMission,type MissionProgress} from './mission.ts';
import {roadMessage,type EndingId} from './roadStory.ts';
export type Mode = 'map' | 'drive' | 'explore';
export interface GameState { version:2; mode:Mode; km:number; fuel:number; food:number; health:number; parts:number; hasCan:boolean; visited:boolean; carX:number; carZ:number; carCondition:number; message:string; encounterResolved:boolean; enemyHealth:number; motelTape:boolean; phoneHeard:boolean; mission:MissionProgress; ending:EndingId|null; }
export const INITIAL:GameState = {version:2,mode:'map',km:0,fuel:44,food:14,health:100,parts:1,hasCan:false,visited:false,carX:0,carZ:19,carCondition:100,message:'La radio repite: «No recojas a nadie en el kilómetro 404».',encounterResolved:false,enemyHealth:75,motelTape:false,phoneHeard:false,mission:{...INITIAL_MISSION},ending:null};
export const MAX_FUEL=80;
export const clamp=(n:number,a:number,b:number):number=>Math.min(b,Math.max(a,n));
export const fresh=():GameState=>({...INITIAL,mission:{...INITIAL_MISSION}});
export function travel(s:GameState,km=24):GameState {
 if(s.fuel<km*.34)return {...s,message:'No queda combustible suficiente. Busca el bidón de la gasolinera.'};
 const nextKm=s.km+km;
 return {...s,km:nextKm,fuel:clamp(s.fuel-km*.34,0,MAX_FUEL),food:Math.max(0,s.food-1),health:s.food>0?s.health:Math.max(0,s.health-4),mode:'map',message:roadMessage(nextKm)};
}
export function pickFuel(s:GameState):GameState {
 if(s.hasCan)return {...s,message:'El bidón está vacío. Lo que queda aquí ya es tuyo.'};
 return {...s,hasCan:true,fuel:clamp(s.fuel+28,0,MAX_FUEL),parts:s.parts+1,message:'Recoges un bidón: +28 L de gasolina y una pieza útil. Alguien susurra tu nombre.'};
}
export function normalizeSave(data:unknown):GameState|null {
 if(!data||typeof data!=='object')return null;
 const v=data as Partial<GameState>;
 if(v.version!==2||!['map','drive','explore'].includes(String(v.mode)))return null;
 for(const k of ['km','fuel','food','health','parts','carX','carZ'] as const){if(typeof v[k]!=='number'||!Number.isFinite(v[k]))return null;}
 if(typeof v.hasCan!=='boolean'||typeof v.visited!=='boolean'||typeof v.message!=='string')return null;
 if(v.encounterResolved!==undefined&&typeof v.encounterResolved!=='boolean')return null;
 if(v.motelTape!==undefined&&typeof v.motelTape!=='boolean')return null;
 if(v.phoneHeard!==undefined&&typeof v.phoneHeard!=='boolean')return null;
 if(v.carCondition!==undefined&&(typeof v.carCondition!=='number'||!Number.isFinite(v.carCondition)))return null;
 if(v.ending!==undefined&&v.ending!==null&&!['dawn','toll','loop'].includes(v.ending))return null;
 if(v.enemyHealth!==undefined&&(!Number.isFinite(v.enemyHealth)||typeof v.enemyHealth!=='number'))return null;
 return {...fresh(),...v,km:clamp(v.km!,0,100000),fuel:clamp(v.fuel!,0,MAX_FUEL),food:clamp(v.food!,0,999),health:clamp(v.health!,0,100),parts:clamp(v.parts!,0,999),carX:clamp(v.carX!,-3.7,3.7),carZ:clamp(v.carZ!,-150,24),carCondition:clamp(v.carCondition??100,0,100),enemyHealth:clamp(v.enemyHealth??75,0,75),motelTape:v.motelTape??false,phoneHeard:v.phoneHeard??false,mission:normalizeMission(v.mission),ending:v.ending??null};
}
