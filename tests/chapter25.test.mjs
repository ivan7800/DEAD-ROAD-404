import test from 'node:test';import assert from 'node:assert/strict';
import {fresh,normalizeSave} from '../src/state.ts';
import {completeChapter,campaignStatus} from '../src/campaign.ts';
import {shouldOfferFinale} from '../src/roadStory.ts';
import {freshChapterFour,normalizeChapterFour,canEnterRadio,beginRadio,radioObjective,nearRadioProp,
 RADIO_POSITIONS,inspectRadioSign,powerRadioRelay,readRadioArchive,tuneRadioMixer,openRadioBunker,
 decodeRadioBunker,disableRadioBreaker,defeatRadioOperator,speakNora,takeRadioSupplies,concludeRadio
} from '../src/chapterFour.ts';
import {radioCollision} from '../src/radioCollision.ts';
import {walkWithSlide} from '../src/worldCollision.ts';
function clearedTown(){
 const f=fresh();
 let campaign=f.campaign;
 for(const chapter of ['last-stop','missing','nameless'])campaign=completeChapter(campaign,chapter);
 return {...f,km:72,encounterResolved:true,mission:{stage:'resolved',choice:'rescue'},
  chapterOne:{...f.chapterOne,stage:'complete',wardenHealth:0},
  chapterTwo:{...f.chapterTwo,stage:'complete',stalkerHealth:0,ending:'silence'},
  chapterThree:{...f.chapterThree,stage:'complete',guardianHealth:0,decision:'transmit'},campaign};
}
const active=()=>beginRadio(clearedTown());
function inBunker(){
 let s=active();s=inspectRadioSign(s);s=powerRadioRelay(s);s=readRadioArchive(s);
 s=tuneRadioMixer(s,'0217');return openRadioBunker(s);
}
function toOperator(){
 let s=decodeRadioBunker(inBunker(),'0313');
 s=disableRadioBreaker(s,'B');s=disableRadioBreaker(s,'A');
 return s;
}
const toDecision=()=>{
 const s=toOperator();return defeatRadioOperator({...s,chapterFour:{...s.chapterFour,operatorHealth:0}});
};
test('la emisora no aparece antes de completar III y alcanzar KM 72',()=>{
 assert.equal(canEnterRadio(fresh()),false);
 assert.equal(beginRadio(fresh()).chapterFour.stage,'locked');
 assert.equal(canEnterRadio({...clearedTown(),km:71}),false);
 assert.equal(canEnterRadio({...clearedTown(),ending:'loop'}),false);
 assert.equal(canEnterRadio(clearedTown()),true);
});
test('inicio registra capítulo IV y no desbloquea V y VI',()=>{
 const s=active();
 assert.equal(s.chapterFour.stage,'arrival');
 assert.equal(s.campaign.current,'dead-frequency');
 assert.equal(campaignStatus(s.campaign,'dead-frequency'),'active');
 assert.equal(campaignStatus(s.campaign,'impossible-mile'),'locked');
 assert.ok(s.campaign.milestones.includes('radioArrival'));
 assert.equal(beginRadio(s).chapterFour.stage,'arrival');
});
test('Nora permite dos respuestas con una sola recompensa persistente',()=>{
 const s=active();
 const helped=speakNora(s,'help'),refused=speakNora(s,'refuse');
 assert.equal(helped.food,s.food+2);
 assert.equal(refused.parts,s.parts+1);
 assert.equal(helped.chapterFour.nora,'help');
 assert.equal(refused.chapterFour.nora,'refuse');
 assert.equal(speakNora(helped,'refuse'),helped);
 assert.deepEqual(speakNora(fresh(),'help'),fresh());
});
test('los códigos 02:17 y 03:13 son dos puzles separados con errores persistentes',()=>{
 let s=active();
 assert.equal(tuneRadioMixer(s,'0217'),s);
 assert.equal(decodeRadioBunker(s,'0313'),s);
 s=inspectRadioSign(s);assert.equal(s.chapterFour.stage,'relay');
 s=powerRadioRelay(s);assert.equal(s.chapterFour.stage,'archive');
 s=readRadioArchive(s);assert.equal(s.chapterFour.stage,'tuning');
 assert.match(s.message,/02:17/);
 s=tuneRadioMixer(s,'1992');
 assert.equal(s.chapterFour.attempts,1);
 assert.equal(s.chapterFour.stage,'tuning');
 s=tuneRadioMixer(s,'0217');
 assert.equal(s.chapterFour.stage,'hatch');
 s=openRadioBunker(s);assert.equal(s.chapterFour.stage,'bunker');
 s=decodeRadioBunker(s,'0000');
 assert.equal(s.chapterFour.subcodeAttempts,1);
 assert.equal(s.chapterFour.stage,'bunker');
 s=decodeRadioBunker(s,'0313');
 assert.equal(s.chapterFour.stage,'breaker');
 assert.ok(s.campaign.milestones.includes('radioDecoded'));
});
test('ambos interruptores son necesarios, no se repiten ni saltan al jefe',()=>{
 const s=decodeRadioBunker(inBunker(),'0313');
 assert.equal(disableRadioBreaker(s,'B').chapterFour.breakersMask,2);
 assert.equal(disableRadioBreaker(s,'A').chapterFour.breakersMask,1);
 let half=disableRadioBreaker(s,'A');
 assert.equal(half.chapterFour.stage,'breaker');
 assert.equal(disableRadioBreaker(half,'A'),half);
 assert.equal(defeatRadioOperator(half),half);
 half=disableRadioBreaker(half,'B');
 assert.equal(half.chapterFour.breakersMask,3);
 assert.equal(half.chapterFour.stage,'sentinel');
 assert.equal(half.chapterFour.operatorHealth,150);
});
test('El Operador debe morir antes de ofrecer las elecciones',()=>{
 const s=toOperator();
 assert.equal(concludeRadio(s,'broadcast'),s);
 assert.equal(defeatRadioOperator(s),s);
 const defeated=defeatRadioOperator({...s,chapterFour:{...s.chapterFour,operatorHealth:0}});
 assert.equal(defeated.chapterFour.stage,'choice');
 assert.ok(defeated.campaign.milestones.includes('radioOperator'));
});
test('dos finales con recursos y progresión persistentes, sin duplicar recompensas',()=>{
 const s=toDecision();
 const aired=concludeRadio({...s,fuel:76},'broadcast');
 assert.equal(aired.fuel,80);
 assert.equal(aired.chapterFour.decision,'broadcast');
 assert.equal(aired.chapterFour.stage,'complete');
 assert.equal(concludeRadio(aired,'broadcast'),aired);
 const severed=concludeRadio(s,'sever');
 assert.equal(severed.parts,s.parts+2);
 assert.equal(campaignStatus(severed.campaign,'dead-frequency'),'completed');
 assert.equal(campaignStatus(severed.campaign,'impossible-mile'),'available');
 assert.equal(radioObjective(severed),'');
});
test('el botiquín opcional no puede recogerse dos veces ni tras recargar',()=>{
 const s={...active(),health:68},done=takeRadioSupplies(s);
 assert.equal(done.health,90);
 assert.equal(done.parts,s.parts+1);
 assert.equal(done.chapterFour.cacheTaken,true);
 assert.equal(takeRadioSupplies(done),done);
 assert.equal(normalizeSave(done)?.chapterFour.cacheTaken,true);
});
test('el final antiguo de F23 se conserva sin completar artificialmente IV',()=>{
 const old={...clearedTown(),km:120};delete old.chapterFour;
 const s=normalizeSave(old);assert.ok(s);
 assert.equal(s.chapterFour.stage,'locked');
 assert.equal(s.chapterFour.legacyFinaleAllowed,true);
 assert.equal(s.campaign.completed.includes('dead-frequency'),false);
 assert.equal(shouldOfferFinale(s),true);
});
test('una partida nueva debe concluir IV antes del final de KM120',()=>{
 const s={...clearedTown(),km:120};
 assert.equal(shouldOfferFinale(s),false);
 const ended=concludeRadio(toDecision(),'sever');
 assert.equal(shouldOfferFinale({...ended,km:120}),false);
 assert.equal(shouldOfferFinale({...ended,km:120,chapterFive:{...ended.chapterFive,stage:'complete',hunterHealth:0,decision:'remember'}}),true);
});
test('guardar y recuperar respeta Nora, dos errores y salud del Operador',()=>{
 let s=active();s=speakNora(s,'help');s=inspectRadioSign(s);s=powerRadioRelay(s);
 s=readRadioArchive(s);s=tuneRadioMixer(s,'0404');s=tuneRadioMixer(s,'0217');
 s=openRadioBunker(s);s=decodeRadioBunker(s,'0217');s=decodeRadioBunker(s,'0313');
 s=disableRadioBreaker(s,'B');s=disableRadioBreaker(s,'A');
 s={...s,chapterFour:{...s.chapterFour,operatorHealth:83}};
 const loaded=normalizeSave(JSON.parse(JSON.stringify(s)));
 assert.equal(loaded?.chapterFour.stage,'sentinel');
 assert.equal(loaded?.chapterFour.attempts,1);
 assert.equal(loaded?.chapterFour.subcodeAttempts,1);
 assert.equal(loaded?.chapterFour.nora,'help');
 assert.equal(loaded?.chapterFour.breakersMask,3);
 assert.equal(loaded?.chapterFour.operatorHealth,83);
 assert.equal(loaded?.campaign.current,'dead-frequency');
});
test('normalización defensiva limpia entradas incorrectas sin desbloquear IV',()=>{
 assert.deepEqual(normalizeChapterFour({stage:'no',operatorHealth:NaN,attempts:Infinity}),freshChapterFour());
 const p=normalizeChapterFour({stage:'sentinel',operatorHealth:0,breakersMask:9,subcodeAttempts:-10});
 assert.equal(p.stage,'choice');assert.equal(p.operatorHealth,0);
 assert.equal(p.breakersMask,3);assert.equal(p.subcodeAttempts,0);
 const old=normalizeSave({...fresh(),campaign:{current:'dead-frequency',completed:['dead-frequency'],milestones:[]},
  chapterFour:{stage:'INVALID',operatorHealth:-5}});
 assert.equal(old?.campaign.current,'last-stop');
 assert.deepEqual(old?.campaign.completed,[]);
 assert.equal(old?.chapterFour.stage,'locked');
});
test('corredor y refugio conectan puntos interactivos sin atravesar estructuras',()=>{
 assert.equal(radioCollision(RADIO_POSITIONS.entry.x,RADIO_POSITIONS.entry.z),false);
 assert.equal(radioCollision(RADIO_POSITIONS.mixer.x,RADIO_POSITIONS.mixer.z),false);
 assert.equal(radioCollision(RADIO_POSITIONS.undergroundEntry.x,RADIO_POSITIONS.undergroundEntry.z),false);
 assert.equal(radioCollision(RADIO_POSITIONS.console.x,RADIO_POSITIONS.console.z),false);
 assert.equal(radioCollision(-31,-43),true);
 assert.equal(radioCollision(-30.8,37),true);
 const walk=walkWithSlide(-22,-29,0,-23,radioCollision);
 assert.ok(walk.z<-51);
 const tunnel=walkWithSlide(-22,32,0,8,radioCollision);
 assert.ok(tunnel.z>39);
});
test('interacciones de radio no se activan desde lejos',()=>{
 for(const pos of Object.values(RADIO_POSITIONS)){
  assert.equal(nearRadioProp(pos.x,pos.z,pos),true);
  assert.equal(nearRadioProp(pos.x+10,pos.z,pos),false);
  assert.equal(nearRadioProp(NaN,pos.z,pos),false);
 }
});
