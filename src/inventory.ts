/** Fase 20: small, bounded inventory independent of old food/parts/fuel counters. */
import type {GameState} from './state.ts';
export const ITEMS={
 medkit:{name:'BOTIQUÍN',description:'Vendas y alcohol. Recupera 35 puntos de salud.',kind:'consumable'},
 ration:{name:'RACIÓN ENVASADA',description:'Comida para el viaje. Recupera 4 raciones.',kind:'consumable'},
 repair:{name:'KIT DE REPARACIÓN',description:'Herramientas y cinta. Recupera 30% de carrocería.',kind:'consumable'},
 key404:{name:'LLAVE 404',description:'Llave metálica que abre algo que todavía no existe.',kind:'quest'},
 motelTape:{name:'CINTA MILE 404',description:'Una grabación que habla de fechas imposibles.',kind:'quest'}
} as const;
export type ItemId=keyof typeof ITEMS;
export type Inventory=Record<ItemId,number>;
const itemIds=Object.keys(ITEMS) as ItemId[];
export const freshInventory=():Inventory=>({medkit:1,ration:0,repair:0,key404:0,motelTape:0});
/** Legacy items are awarded based on established progress; empty new saves never get a free key. */
export function normalizeInventory(value:unknown,legacy?:{mission:{stage:string};motelTape:boolean}):Inventory{
 const v=value&&typeof value==='object'?value as Partial<Record<ItemId,unknown>>:null;
 const out=freshInventory();
 for(const id of itemIds){
  if(v&&Object.prototype.hasOwnProperty.call(v,id)){
   const n=v[id];out[id]=typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(99,Math.floor(n))):0;
  }else if(v){out[id]=0;}
 }
 if(legacy){
  if(['key','resolved'].includes(legacy.mission.stage))out.key404=Math.max(1,out.key404);
  if(legacy.motelTape)out.motelTape=Math.max(1,out.motelTape);
 }
 return out;
}
export function addItem(inv:Inventory,id:ItemId,count=1):Inventory{
 if(!itemIds.includes(id)||!Number.isSafeInteger(count)||count<1)return {...inv};
 return {...inv,[id]:Math.min(99,inv[id]+count)};
}
export function inventoryTotal(inv:Inventory):number{return itemIds.reduce((sum,id)=>sum+inv[id],0);}
export interface UseResult {state:GameState;used:boolean;message:string}
export function useItem(s:GameState,id:ItemId):UseResult{
 const item=ITEMS[id];if(!item)return {state:s,used:false,message:'Objeto desconocido.'};
 if(s.inventory[id]<=0)return {state:s,used:false,message:'No llevas ese objeto.'};
 if(item.kind==='quest')return {state:s,used:false,message:'Es una pista. Examínala en el diario; no se puede consumir.'};
 const inventory={...s.inventory,[id]:s.inventory[id]-1};
 if(id==='medkit'){
  if(s.health>=100)return {state:s,used:false,message:'Ya tienes la salud al máximo.'};
  return {state:{...s,inventory,health:Math.min(100,s.health+35)},used:true,message:'Botiquín utilizado · +35 salud.'};
 }
 if(id==='ration'){
  if(s.food>=999)return {state:s,used:false,message:'No puedes transportar más comida.'};
  return {state:{...s,inventory,food:Math.min(999,s.food+4)},used:true,message:'Ración consumida · +4 comida.'};
 }
 if(id==='repair'){
  if(s.carCondition>=100)return {state:s,used:false,message:'El Firebird no necesita reparación.'};
  return {state:{...s,inventory,carCondition:Math.min(100,s.carCondition+30)},used:true,message:'Kit utilizado · +30% carrocería.'};
 }
 return {state:s,used:false,message:'Objeto no utilizable.'};
}
/** Fixed world cache, visible in the forecourt; can only be opened once per save. */
export const CACHE_POSITION={x:9,z:5.4} as const;
export function openSupplyCache(s:GameState):{state:GameState;opened:boolean;message:string}{
 if(s.supplyCacheTaken)return {state:s,opened:false,message:'El cajón ya está vacío.'};
 return {
  state:{...s,supplyCacheTaken:true,inventory:addItem(addItem(addItem(s.inventory,'medkit',1),'ration',1),'repair',1)},
  opened:true,
  message:'Caja SUNSPUR: +1 botiquín, +1 ración, +1 kit de reparación.'
 };
}
