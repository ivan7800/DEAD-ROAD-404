import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,normalizeSave} from '../src/state.ts';
import {campaignStatus,completeChapter,normalizeCampaign} from '../src/campaign.ts';
import {shouldOfferFinale} from '../src/roadStory.ts';
import {
 MILE_POSITIONS,nearMile,canEnterMile,beginMile,inspectMileSign,inspectMileLog,
 activateMileBeacon,tuneMileDial,defeatMileHunter,takeMileSupplies,concludeMile,
 normalizeChapterFive,freshChapterFive
} from '../src/chapterFive.ts';
import {freshMileHunter,stepMileHunter,strikeMileHunter} from '../src/mileHunter.ts';
import {mileCollision} from '../src/mileCollision.ts';
const ready=()=>{
 const s=fresh();s.km=96;s.chapterOne.stage='complete';
 s.chapterTwo.stage='complete';s.chapterThree.stage='complete';s.chapterFour.stage='complete';
 s.campaign.completed=['last-stop','missing','nameless','dead-frequency'];
 return s;
};
test('capítulo V requiere radio terminada y KM96, no se salta por kilometraje',()=>{
 const s=ready();assert.equal(canEnterMile(s),true);assert.equal(canEnterMile({...s,km:72}),false);
 assert.equal(canEnterMile({...s,chapterFour:{...s.chapterFour,stage:'choice'}}),false);
 assert.equal(canEnterMile({...s,campaign:{...s.campaign,completed:['last-stop','missing','nameless']}}),false);
 assert.equal(campaignStatus(s.campaign,'impossible-mile'),'available');
 assert.equal(campaignStatus(s.campaign,'road-end'),'locked');
});
test('ruta ambiental completa, pistas consistentes, dos balizas en cualquier orden',()=>{
 let s=beginMile(ready());assert.equal(s.chapterFive.stage,'arrival');
 assert.equal(s.campaign.current,'impossible-mile');
 s=inspectMileSign(s);assert.equal(s.chapterFive.stage,'log');
 s=inspectMileLog(s);assert.equal(s.chapterFive.stage,'beacons');
 s=activateMileBeacon(s,'B');assert.equal(s.chapterFive.beaconsMask,2);
 assert.equal(activateMileBeacon(s,'B'),s);
 s=activateMileBeacon(s,'A');assert.equal(s.chapterFive.beaconsMask,3);
 assert.equal(s.chapterFive.stage,'dial');
 s=tuneMileDial(s,'0404');assert.equal(s.chapterFive.dialAttempts,1);
 assert.equal(s.chapterFive.stage,'dial');
 s=tuneMileDial(s,'2496');assert.equal(s.chapterFive.stage,'hunter');
 assert.equal(s.chapterFive.dialAttempts,1);
 s={...s,chapterFive:{...s.chapterFive,hunterHealth:0}};
 s=defeatMileHunter(s);assert.equal(s.chapterFive.stage,'choice');
 s=concludeMile(s,'remember');assert.equal(s.chapterFive.stage,'complete');
 assert.equal(s.chapterFive.decision,'remember');
 assert.equal(s.campaign.completed.at(-1),'impossible-mile');
 assert.equal(s.fuel,56);assert.equal(s.parts,1);
 assert.equal(concludeMile(s,'forget'),s);
});
test('las decisiones y suministros no pueden duplicarse',()=>{
 let s=beginMile(ready());s.health=70;
 s=takeMileSupplies(s);assert.equal(s.health,88);assert.equal(s.food,16);
 assert.equal(takeMileSupplies(s),s);
 s=inspectMileSign(s);s=inspectMileLog(s);
 s=activateMileBeacon(activateMileBeacon(s,'A'),'B');s=tuneMileDial(s,'2496');
 s={...s,chapterFive:{...s.chapterFive,hunterHealth:0}};s=defeatMileHunter(s);
 s=concludeMile(s,'forget');assert.equal(s.parts,4);
 assert.equal(concludeMile(s,'remember'),s);
});
test('normalización de estado previene máscaras inválidas y partidas maliciosas',()=>{
 assert.deepEqual(normalizeChapterFive({stage:'locked',beaconsMask:3}),freshChapterFive());
 const a=normalizeChapterFive({stage:'beacons',beaconsMask:99,dialAttempts:Infinity,hunterHealth:200,decision:'remember'});
 assert.equal(a.beaconsMask,0);assert.equal(a.dialAttempts,0);assert.equal(a.hunterHealth,120);assert.equal(a.decision,null);
 const b=normalizeChapterFive({stage:'hunter',beaconsMask:0,hunterHealth:0});
 assert.equal(b.stage,'choice');assert.equal(b.beaconsMask,3);
 const s=ready();s.chapterFive.stage='beacons';s.chapterFive.beaconsMask=2;
 const saved=normalizeSave(JSON.parse(JSON.stringify(s)));
 assert.equal(saved?.chapterFive.stage,'beacons');assert.equal(saved?.chapterFive.beaconsMask,2);
 assert.equal(saved?.version,2);
});
test('partidas F25 existentes mantienen su antiguo epílogo; partidas nuevas deben completar V',()=>{
 let legacy=ready();legacy.km=120;legacy.mission.stage='resolved';
 legacy.chapterFive=undefined;
 const old=normalizeSave(JSON.parse(JSON.stringify(legacy)));
 assert.equal(old?.chapterFive.legacyFinaleAllowed,true);
 assert.equal(shouldOfferFinale(old),true);
 const newer=ready();newer.km=120;newer.mission.stage='resolved';
 assert.equal(shouldOfferFinale(newer),false);
 newer.chapterFive.stage='complete';newer.chapterFive.decision='remember';
 assert.equal(shouldOfferFinale(newer),true);
});
test('el Agrimensor necesita orientación, se acerca y ataca con aviso',()=>{
 const w=freshMileHunter();
 assert.equal(w.health,120);
 assert.equal(strikeMileHunter(w,0,-52,Math.PI).hit,false);
 const h=strikeMileHunter(w,0,-52,0);
 assert.equal(h.hit,true);assert.equal(h.hunter.health,90);
 assert.equal(strikeMileHunter(h.hunter,0,-52,0,100).defeated,true);
 let a=freshMileHunter();let triggered=false;
 for(let i=0;i<1000;i++){
  const next=stepMileHunter(a,0,-50,.03);a=next.hunter;
  if(next.telegraph){triggered=true;break;}
 }
 assert.equal(triggered,true);
 assert.equal(nearMile(0,-12,MILE_POSITIONS.sign),true);
 assert.equal(mileCollision(12,-40),true);
 assert.equal(mileCollision(0,-40),false);
});
test('un guardado con secuencia imposible no puede completar capítulo V por la campaña',()=>{
 const c=normalizeCampaign({current:'impossible-mile',completed:['last-stop','impossible-mile'],milestones:['mileDial','nonexistent']});
 assert.deepEqual(c.completed,['last-stop']);
 assert.equal(c.current,'last-stop');
});
