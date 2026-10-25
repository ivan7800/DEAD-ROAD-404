/** Road-act progression and persistent endings. Pure rules, independently testable. */
import type {GameState} from './state.ts';
import {completeChapter,recordMilestone} from './campaign.ts';
export type EndingId='dawn'|'toll'|'loop'|'chorus';
export type FinalApproach='escape'|'listen';
export const ENDINGS:Record<EndingId,{title:string;text:string}>={
 dawn:{title:'AMANECER PRESTADO',text:'Vera rompe la cinta de la radio y el Firebird atraviesa la última señal. Por primera vez, el horizonte no se repite. El amanecer tiene el color de una herida antigua, pero la carretera ha terminado. FINAL I — LOS QUE SALIERON.'},
 toll:{title:'EL PEAJE',text:'Atraviesas el desvío. La carretera te permite salir, pero se queda con algo que no sabrás nombrar. En el retrovisor ves a un conductor idéntico a ti esperando ante SUNSPUR. FINAL II — EL PRECIO DE SALIR.'},
 loop:{title:'KILÓMETRO 404',text:'Sintonizas de nuevo la frecuencia. La voz te explica por qué la gasolinera nunca cierra: siempre estás llegando. El marcador vuelve a cero. Afuera una figura lleva tu chaqueta. FINAL III — LA CARRETERA RECUERDA.'},
 chorus:{title:'EL CORO DE LOS AUSENTES',text:'Reconoces cada nombre, aun los que todavía no han nacido. La voz de Nora encuentra un camino fuera de la emisora y el pueblo despierta en muchas memorias a la vez. Tu coche permanece en el último desvío, con la radio encendida. FINAL IV — LOS QUE SIGUEN AQUÍ.'},
};
export const FINALE_OPTIONS:ReadonlyArray<{id:FinalApproach;label:string;description:string}>=[
 {id:'escape',label:'ABANDONAR LA CARRETERA',description:'Intentar atravesar el desvío iluminado.'},
 {id:'listen',label:'ESCUCHAR LA RADIO',description:'Responder a la voz que sabe tu nombre.'},
];
export function roadMessage(km:number):string {
 if(km>=120)return 'KM 120 · Aparece un desvío que no figura en ningún mapa. La radio exige una respuesta.';
 if(km>=96)return 'KM 96 · La misma cruz vuelve a pasar. Los kilómetros se repiten, pero el depósito no.';
 if(km>=72)return 'KM 72 · La antena de WXR-404 emite hacia el subsuelo. Alguien responde desde un teléfono sin cables.';
 if(km>=48)return 'KM 48 · Un pueblo sin nombre figura en la carretera. El campanario marca las 03:13 y no avanza.';
 return 'KM 24 · Una señal anuncia: «La Última Parada — siempre abierta».';
}
/** Historical saves from chapters II–IV preserve their original KM120 finale. */
const hasLegacyEpilogue=(s:GameState):boolean=>s.chapterTwo.legacyFinaleAllowed||s.chapterThree.legacyFinaleAllowed||s.chapterFour.legacyFinaleAllowed||s.chapterFive.legacyFinaleAllowed||s.chapterSix.legacyFinaleAllowed;
export function shouldOfferFinale(s:GameState):boolean {
 return s.km>=120&&s.mission.stage==='resolved'&&s.chapterOne.stage==='complete'&&(s.chapterTwo.stage==='complete'||s.chapterTwo.legacyFinaleAllowed)&&(s.chapterThree.stage==='complete'||s.chapterThree.legacyFinaleAllowed)&&(s.chapterFour.stage==='complete'||s.chapterFour.legacyFinaleAllowed)&&(s.chapterFive.stage==='complete'||hasLegacyEpilogue(s))&&(s.chapterSix.stage==='choice'||hasLegacyEpilogue(s))&&s.ending===null&&s.health>0;
}
export function roadObjective(s:GameState):string {
 if(s.ending)return 'FINAL REGISTRADO · '+ENDINGS[s.ending].title+' · [J] DIARIO';
 if(s.mission.stage!=='resolved'||s.chapterOne.stage!=='complete'||(s.chapterTwo.stage!=='complete'&&!s.chapterTwo.legacyFinaleAllowed)||(s.chapterThree.stage!=='complete'&&!s.chapterThree.legacyFinaleAllowed)||(s.chapterFour.stage!=='complete'&&!s.chapterFour.legacyFinaleAllowed)||(s.chapterFive.stage!=='complete'&&!hasLegacyEpilogue(s)))return '';
 if(s.chapterSix.stage==='choice')return 'CAPÍTULO VI · La última decisión te espera tras la barrera.';
 if(s.chapterSix.stage==='complete')return '';
 return s.km>=120?(hasLegacyEpilogue(s)?'El último desvío aguarda tu decisión.':'Entra en el último desvío para terminar la campaña.'):'Sigue conduciendo hasta el último desvío · '+Math.max(0,120-s.km)+' km restantes';
}
export function resolveFinale(s:GameState,choice:FinalApproach):GameState {
 if(!shouldOfferFinale(s)||!['escape','listen'].includes(choice))return {...s};
 const secret=choice==='listen'&&s.chapterSix.stage==='choice'&&
  s.chapterFour.decision==='broadcast'&&s.chapterFive.decision==='remember'&&
  s.chapterThree.decision==='transmit';
 const ending:EndingId=secret?'chorus':choice==='listen'?'loop':
  s.mission.choice==='rescue'&&s.fuel>=4&&s.parts>=1?'dawn':'toll';
 const finaleCampaign=recordMilestone(s.campaign,'junction');
 const chapterSix=s.chapterSix.stage==='choice'?{...s.chapterSix,stage:'complete' as const}:s.chapterSix;
 return {...s,ending,chapterSix,
  campaign:s.chapterSix.stage==='choice'?completeChapter(finaleCampaign,'road-end'):completeChapter(finaleCampaign,'last-stop'),
  message:ENDINGS[ending].title+' · La transmisión ha terminado.'};
}
