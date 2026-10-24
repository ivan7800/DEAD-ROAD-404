export type MissionStage='arrival'|'signal'|'key'|'resolved';
export type MissionChoice='rescue'|'take'|'leave';
export interface MissionProgress {stage:MissionStage; choice:MissionChoice|null;}
export const INITIAL_MISSION:MissionProgress={stage:'arrival',choice:null};
export function normalizeMission(value:unknown):MissionProgress {
 if(!value||typeof value!=='object')return {...INITIAL_MISSION};
 const m=value as Partial<MissionProgress>;
 if(!['arrival','signal','key','resolved'].includes(String(m.stage)))return {...INITIAL_MISSION};
 if(m.choice!==null&&m.choice!==undefined&&!['rescue','take','leave'].includes(String(m.choice)))return {...INITIAL_MISSION};
 if(m.stage==='resolved'&&!m.choice)return {...INITIAL_MISSION};
 return {stage:m.stage!,choice:m.stage==='resolved'?m.choice!:null};
}
export function missionObjective(m:MissionProgress):string {
 switch(m.stage){case 'arrival':return 'Investiga la radio de la tienda [R]';case 'signal':return 'Encuentra la llave en la trastienda [E]';case 'key':return 'Habla con Vera junto al motel [E]';default:return 'Misión completada · Regresa al Firebird [M]';}
}
export function advanceMission(m:MissionProgress,action:'radio'|'key'|'talk',choice?:MissionChoice):MissionProgress {
 if(m.stage==='arrival'&&action==='radio')return {stage:'signal',choice:null};
 if(m.stage==='signal'&&action==='key')return {stage:'key',choice:null};
 if(m.stage==='key'&&action==='talk'&&choice&&['rescue','take','leave'].includes(choice))return {stage:'resolved',choice};
 return {...m};
}
export const MISSION_CHOICES:ReadonlyArray<{id:MissionChoice;label:string;description:string}>=[
 {id:'rescue',label:'Llevar a Vera contigo',description:'-3 comida, +1 pieza. Alguien vigilará la carretera contigo.'},
 {id:'take',label:'Exigir pago por la llave',description:'+2 piezas, -10 salud. No todos perdonan un chantaje.'},
 {id:'leave',label:'Cerrar la puerta y marcharte',description:'+5 comida. La voz de Vera seguirá en la radio.'},
];
