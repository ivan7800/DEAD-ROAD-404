/** Edge impacts, engine damage and repairs are deterministic and frame-rate bounded. */
import type {GameState} from './state.ts';
export interface WearState {condition:number;cooldown:number}
export function roadEdgeImpact(wear:WearState,speed:number,hitEdge:boolean,dt:number):WearState & {speed:number;hit:boolean} {
 const condition=Math.max(0,Math.min(100,Number.isFinite(wear.condition)?wear.condition:100));
 const cooldown=Math.max(0,(Number.isFinite(wear.cooldown)?wear.cooldown:0)-Math.max(0,Number.isFinite(dt)?dt:0));
 if(!hitEdge||cooldown>0||Math.abs(speed)<8||condition<=0)return {condition,cooldown,speed,hit:false};
 const damage=Math.min(26,Math.max(7,Math.round((Math.abs(speed)-5)*1.5)));
 const nextCondition=Math.max(0,condition-damage);
 return {condition:nextCondition,cooldown:1.8,speed:Math.sign(speed)*Math.abs(speed)*.48,hit:true};
}
export function repairVehicle(s:GameState):GameState {
 if(s.carCondition>=100)return {...s,message:'El Firebird ya está en perfecto estado.'};
 if(s.parts<1)return {...s,message:'No tienes piezas para reparar el Firebird. Busca suministros.'};
 return {...s,parts:s.parts-1,carCondition:Math.min(100,s.carCondition+35),message:'Reparación improvisada: -1 pieza · +35% carrocería.'};
}
