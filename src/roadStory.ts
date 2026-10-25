/** Road-act progression and persistent endings. Pure rules, independently testable. */
import type {GameState} from './state.ts';
export type EndingId='dawn'|'toll'|'loop';
export type FinalApproach='escape'|'listen';
export const ENDINGS:Record<EndingId,{title:string;text:string}>={
 dawn:{title:'AMANECER PRESTADO',text:'Vera rompe la cinta de la radio y el Firebird atraviesa la última señal. Por primera vez, el horizonte no se repite. El amanecer tiene el color de una herida antigua, pero la carretera ha terminado. FINAL I — LOS QUE SALIERON.'},
 toll:{title:'EL PEAJE',text:'Atraviesas el desvío. La carretera te permite salir, pero se queda con algo que no sabrás nombrar. En el retrovisor ves a un conductor idéntico a ti esperando ante SUNSPUR. FINAL II — EL PRECIO DE SALIR.'},
 loop:{title:'KILÓMETRO 404',text:'Sintonizas de nuevo la frecuencia. La voz te explica por qué la gasolinera nunca cierra: siempre estás llegando. El marcador vuelve a cero. Afuera una figura lleva tu chaqueta. FINAL III — LA CARRETERA RECUERDA.'},
};
export const FINALE_OPTIONS:ReadonlyArray<{id:FinalApproach;label:string;description:string}>=[
 {id:'escape',label:'ABANDONAR LA CARRETERA',description:'Intentar atravesar el desvío iluminado.'},
 {id:'listen',label:'ESCUCHAR LA RADIO',description:'Responder a la voz que sabe tu nombre.'},
];
export function roadMessage(km:number):string {
 if(km>=120)return 'KM 120 · Aparece un desvío que no figura en ningún mapa. La radio exige una respuesta.';
 if(km>=96)return 'KM 96 · La misma cruz vuelve a pasar. Los kilómetros se repiten, pero el depósito no.';
 if(km>=72)return 'KM 72 · Una hilera de teléfonos suena en mitad del desierto. Ninguno tiene cable.';
 if(km>=48)return 'KM 48 · Las luces de SUNSPUR aparecen detrás de ti, aunque llevas una hora conduciendo.';
 return 'KM 24 · Una señal anuncia: «La Última Parada — siempre abierta».';
}
export function shouldOfferFinale(s:GameState):boolean {
 return s.km>=120&&s.mission.stage==='resolved'&&s.ending===null&&s.health>0;
}
export function roadObjective(s:GameState):string {
 if(s.ending)return 'FINAL REGISTRADO · '+ENDINGS[s.ending].title+' · [J] DIARIO';
 if(s.mission.stage!=='resolved')return '';
 return s.km>=120?'El último desvío aguarda tu decisión.':'Sigue conduciendo hasta el último desvío · '+Math.max(0,120-s.km)+' km restantes';
}
export function resolveFinale(s:GameState,choice:FinalApproach):GameState {
 if(!shouldOfferFinale(s)||!['escape','listen'].includes(choice))return {...s};
 const ending:EndingId=choice==='listen'?'loop':s.mission.choice==='rescue'&&s.fuel>=4&&s.parts>=1?'dawn':'toll';
 return {...s,ending,message:ENDINGS[ending].title+' · La transmisión ha terminado.'};
}
