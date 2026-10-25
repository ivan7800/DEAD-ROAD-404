import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,normalizeSave} from '../src/state.ts';
import {normalizeCampaign,campaignStatus} from '../src/campaign.ts';
import {ENDINGS,resolveFinale,shouldOfferFinale} from '../src/roadStory.ts';
import {freshChapterSix,normalizeChapterSix,canEnterRoadEnd,beginRoadEnd,
 readEndSign,readEndLedger,enableEndRelay,enterEndCode,defeatRoadDouble,
 takeEndSupplies,nearRoadEnd,END_POSITIONS} from '../src/chapterSix.ts';
import {freshRoadDouble,strikeRoadDouble,stepRoadDouble} from '../src/roadDouble.ts';
import {roadEndCollision} from '../src/roadEndCollision.ts';

const ready=()=>{
 const s=fresh();s.km=120;s.mission={stage:'resolved',choice:'rescue'};
 s.chapterOne.stage='complete';s.chapterTwo.stage='complete';s.chapterThree.stage='complete';
 s.chapterFour.stage='complete';s.chapterFive.stage='complete';
 s.chapterThree.decision='seal';s.chapterFour.decision='sever';s.chapterFive.decision='remember';
 s.campaign.completed=['last-stop','missing','nameless','dead-frequency','impossible-mile'];
 s.fuel=40;s.parts=3;return s;
};
const toFinal=()=>{
 let s=beginRoadEnd(ready());
 s=readEndSign(s);s=readEndLedger(s);s=enableEndRelay(s,'B');s=enableEndRelay(s,'A');
 s=enterEndCode(s,'1204');s={...s,chapterSix:{...s.chapterSix,doubleHealth:0}};
 return defeatRoadDouble(s);
};
test('seis capítulos: el último no se desbloquea antes del V y KM120',()=>{
 assert.equal(canEnterRoadEnd(fresh()),false);
 assert.equal(canEnterRoadEnd({...ready(),km:96}),false);
 assert.equal(canEnterRoadEnd({...ready(),chapterFive:{...ready().chapterFive,stage:'choice'}}),false);
 assert.equal(canEnterRoadEnd(ready()),true);
 assert.equal(campaignStatus(ready().campaign,'road-end'),'available');
});
test('ruta completa del último peaje y clave ambiental 1204',()=>{
 let s=beginRoadEnd(ready());assert.equal(s.chapterSix.stage,'arrival');
 assert.equal(s.campaign.current,'road-end');
 s=readEndSign(s);assert.equal(s.chapterSix.stage,'ledger');
 s=readEndLedger(s);assert.equal(s.chapterSix.stage,'relays');
 s=enableEndRelay(s,'B');assert.equal(s.chapterSix.relaysMask,2);
 assert.equal(enableEndRelay(s,'B'),s);
 s=enableEndRelay(s,'A');assert.equal(s.chapterSix.relaysMask,3);
 assert.equal(s.chapterSix.stage,'cipher');
 s=enterEndCode(s,'0217');assert.equal(s.chapterSix.codeAttempts,1);
 assert.equal(s.chapterSix.stage,'cipher');
 s=enterEndCode(s,'1204');assert.equal(s.chapterSix.stage,'double');
 s=defeatRoadDouble(s);assert.equal(s.chapterSix.stage,'double');
 s=defeatRoadDouble({...s,chapterSix:{...s.chapterSix,doubleHealth:0}});
 assert.equal(s.chapterSix.stage,'choice');
 assert.equal(shouldOfferFinale(s),true);
});
test('cuatro finales auténticos, cierre de VI, idempotencia y dependencia narrativa',()=>{
 let s=toFinal();assert.equal(shouldOfferFinale(s),true);
 const dawn=resolveFinale(s,'escape');
 assert.equal(dawn.ending,'dawn');assert.equal(dawn.chapterSix.stage,'complete');
 assert.equal(dawn.campaign.completed.at(-1),'road-end');
 assert.equal(shouldOfferFinale(dawn),false);
 assert.deepEqual(resolveFinale(dawn,'listen'),dawn);
 const toll=resolveFinale({...s,mission:{stage:'resolved',choice:'take'}},'escape');
 assert.equal(toll.ending,'toll');
 const loop=resolveFinale(s,'listen');assert.equal(loop.ending,'loop');
 s={...s,chapterThree:{...s.chapterThree,decision:'transmit'},
  chapterFour:{...s.chapterFour,decision:'broadcast'},
  chapterFive:{...s.chapterFive,decision:'remember'}};
 assert.equal(resolveFinale(s,'listen').ending,'chorus');
 assert.equal(Object.keys(ENDINGS).length,4);
 assert.match(ENDINGS.chorus.text,/FINAL IV/);
});
test('maleta opcional y relés no pueden duplicar recursos',()=>{
 let s=beginRoadEnd(ready());s.health=55;
 s=takeEndSupplies(s);assert.equal(s.health,75);assert.equal(s.parts,4);
 assert.equal(takeEndSupplies(s),s);
 assert.equal(normalizeSave(JSON.parse(JSON.stringify(s)))?.chapterSix.suppliesTaken,true);
 s=readEndSign(s);s=readEndLedger(s);s=enableEndRelay(s,'A');
 assert.equal(enableEndRelay(s,'A'),s);
});
test('migración preserva los finales de F26, nueva partida exige capítulo VI',()=>{
 const old=ready();delete old.chapterSix;
 const restored=normalizeSave(JSON.parse(JSON.stringify(old)));
 assert.equal(restored?.chapterSix.legacyFinaleAllowed,true);
 assert.equal(shouldOfferFinale(restored),true);
 assert.equal(shouldOfferFinale(ready()),false);
 const completed=resolveFinale({...restored,km:120},'listen');
 assert.equal(completed.ending,'loop');
 assert.equal(completed.campaign.completed.includes('road-end'),false);
 assert.equal(normalizeSave(completed)?.ending,'loop');
});
test('normalización defensiva conserva progreso válido y rechaza máscara imposible',()=>{
 assert.deepEqual(normalizeChapterSix({stage:'locked',relaysMask:3}),freshChapterSix());
 const broken=normalizeChapterSix({stage:'relays',relaysMask:999,doubleHealth:Infinity,codeAttempts:-3});
 assert.equal(broken.relaysMask,0);assert.equal(broken.doubleHealth,140);
 assert.equal(broken.codeAttempts,0);
 const done=normalizeChapterSix({stage:'double',doubleHealth:0,relaysMask:1});
 assert.equal(done.stage,'choice');assert.equal(done.relaysMask,3);
 const midway=beginRoadEnd(ready());midway.chapterSix.stage='relays';midway.chapterSix.relaysMask=2;
 const recovered=normalizeSave(JSON.parse(JSON.stringify(midway)));
 assert.equal(recovered?.chapterSix.stage,'relays');
 assert.equal(recovered?.chapterSix.relaysMask,2);
 assert.equal(recovered?.campaign.current,'road-end');
 assert.deepEqual(normalizeCampaign({completed:['road-end'],current:'road-end',milestones:['endCode','invalid']}).completed,[]);
});
test('El Doble requiere orientación real, persigue y anuncia el golpe',()=>{
 let w=freshRoadDouble();assert.equal(w.health,140);
 assert.equal(strikeRoadDouble(w,0,-52,Math.PI).hit,false);
 let h=strikeRoadDouble(w,0,-52,0);
 assert.equal(h.hit,true);assert.equal(h.double.health,105);
 assert.equal(strikeRoadDouble(h.double,0,-52,0,200).defeated,true);
 let warned=false;
 for(let i=0;i<1100;i++){
  const result=stepRoadDouble(w,0,-50,.03);w=result.double;
  if(result.telegraph){warned=true;break;}
 }
 assert.equal(warned,true);
 assert.equal(nearRoadEnd(0,-10,END_POSITIONS.sign),true);
 assert.equal(roadEndCollision(12,-40),true);
 assert.equal(roadEndCollision(0,-40),false);
});
