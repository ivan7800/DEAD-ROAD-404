/** Evento opcional de 1992; sin recursos gratuitos ni cambio del recorrido principal. */
export const PHONE_POSITION={x:27,z:3} as const;
export const PHONE_RANGE=2.8;
export type PhoneStage='arrival'|'signal'|'key'|'resolved';
export function canAnswerPhone(stage:PhoneStage,heard:boolean):boolean {
 return stage!=='arrival'&&!heard;
}
export function isAtPhone(x:number,z:number):boolean{
 return Number.isFinite(x)&&Number.isFinite(z)&&Math.hypot(x-PHONE_POSITION.x,z-PHONE_POSITION.z)<=PHONE_RANGE;
}
export function answerPhone(stage:PhoneStage,heard:boolean){
 if(stage==='arrival')return {heard:false,message:'No hay tono. Solo una respiración que no coincide con la tuya.'};
 if(heard)return {heard:true,message:'La línea ha quedado muda. En el auricular sigue oliendo a lluvia.'};
 return {heard:true,message:'CABINA 404 · «No mires el calendario de la habitación seis. Todavía no ha ocurrido». La llamada termina con tu propia voz diciendo adiós.'};
}
