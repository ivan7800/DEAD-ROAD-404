import test from 'node:test';import assert from 'node:assert/strict';
import {fresh,normalizeSave,travel} from '../src/state.ts';
import {completeChapter,campaignStatus} from '../src/campaign.ts';
import {shouldOfferFinale} from '../src/roadStory.ts';
import {freshChapterThree,normalizeChapterThree,TOWN_LOCATIONS,canEnterTown,beginTown,townObjective,
 nearTownObject,speakWitness,readMemorial,restoreTownPower,readTownArchive,enterTownCode,
 openTownChapel,defeatTownGuardian,takeTownSupplies,concludeTown} from '../src/chapterThree.ts';
import {townCollision} from '../src/townCollision.ts';
import {walkWithSlide} from '../src/worldCollision.ts';
const ready=()=>{
 const f=fresh();
 const c=completeChapter(completeChapter(f.campaign,'last-stop'),'missing');
 return {...f,km:48,mission:{stage:'resolved',choice:'rescue'},
  chapterOne:{...f.chapterOne,stage:'complete',wardenHealth:0},
  chapterTwo:{...f.chapterTwo,stage:'complete',stalkerHealth:0,ending:'broadcast'},
  campaign:c,encounterResolved:true};
};
const active=()=>beginTown(ready());
function toChoice(){
 let s=active();s=readMemorial(s);s=restoreTownPower(s);s=readTownArchive(s);
 s=enterTownCode(s,'0313');s=openTownChapel(s);
 return defeatTownGuardian({...s,chapterThree:{...s.chapterThree,guardianHealth:0}});
}
test('el pueblo aparece solo después de II y KM 48',()=>{
 assert.equal(canEnterTown(fresh()),false);
 assert.equal(beginTown(fresh()).chapterThree.stage,'locked');
 assert.equal(canEnterTown({...ready(),km:47}),false);
 assert.equal(canEnterTown({...ready(),ending:'loop'}),false);
 assert.equal(canEnterTown(ready()),true);
});
test('llegada inicia III y mantiene IV–VI bloqueados',()=>{
 const s=active();
 assert.equal(s.chapterThree.stage,'arrival');
 assert.equal(s.campaign.current,'nameless');
 assert.equal(campaignStatus(s.campaign,'nameless'),'active');
 assert.equal(campaignStatus(s.campaign,'dead-frequency'),'locked');
 assert.ok(s.campaign.milestones.includes('townArrival'));
 assert.equal(beginTown(s).chapterThree.stage,'arrival');
});
test('Elías tiene decisiones alternativas y recompensa única',()=>{
 const s=active();
 const believe=speakWitness(s,'believe'),doubt=speakWitness(s,'doubt');
 assert.equal(believe.food,s.food+2);
 assert.equal(doubt.parts,s.parts+1);
 assert.equal(believe.chapterThree.witness,'believe');
 assert.equal(doubt.chapterThree.witness,'doubt');
 assert.equal(speakWitness(believe,'doubt'),believe);
 assert.deepEqual(speakWitness(fresh(),'believe'),fresh());
});
test('recorrido completo del misterio 03:13 con errores registrados',()=>{
 let s=active();
 assert.equal(readTownArchive(s),s);
 assert.equal(openTownChapel(s),s);
 s=readMemorial(s);assert.equal(s.chapterThree.stage,'generator');
 assert.ok(s.campaign.milestones.includes('townMemorial'));
 s=restoreTownPower(s);assert.equal(s.chapterThree.stage,'archive');
 s=readTownArchive(s);assert.equal(s.chapterThree.stage,'frequency');
 assert.match(s.message,/03:13/);
 s=enterTownCode(s,'0404');assert.equal(s.chapterThree.attempts,1);
 assert.equal(s.chapterThree.stage,'frequency');
 s=enterTownCode(s,'0313');assert.equal(s.chapterThree.stage,'chapel');
 s=openTownChapel(s);assert.equal(s.chapterThree.stage,'guardian');
 assert.equal(s.chapterThree.guardianHealth,120);
 assert.ok(s.campaign.milestones.includes('townChapel'));
});
test('El Campanero debe caer antes de abrir la decisión final',()=>{
 let s=active();s=readMemorial(s);s=restoreTownPower(s);s=readTownArchive(s);
 s=enterTownCode(s,'0313');s=openTownChapel(s);
 assert.equal(defeatTownGuardian(s),s);
 assert.equal(concludeTown(s,'seal'),s);
 s=defeatTownGuardian({...s,chapterThree:{...s.chapterThree,guardianHealth:0}});
 assert.equal(s.chapterThree.stage,'choice');
 assert.ok(s.campaign.milestones.includes('townGuardian'));
});
test('una sola recompensa por decidir, cuatro capítulos posteriores aún bloqueados',()=>{
 const s=toChoice();
 const trans=concludeTown({...s,fuel:75},'transmit');
 assert.equal(trans.fuel,80);
 assert.equal(trans.chapterThree.decision,'transmit');
 assert.equal(trans.chapterThree.stage,'complete');
 assert.equal(concludeTown(trans,'transmit'),trans);
 const seal=concludeTown({...s,health:60},'seal');
 assert.equal(seal.health,85);
 assert.equal(seal.chapterThree.decision,'seal');
 assert.equal(campaignStatus(seal.campaign,'nameless'),'completed');
 assert.equal(campaignStatus(seal.campaign,'dead-frequency'),'available');
});
test('caja municipal no permite farmear suministros al recargar',()=>{
 const s={...active(),health:87};
 const reward=takeTownSupplies(s);
 assert.equal(reward.health,100);
 assert.equal(reward.parts,s.parts+1);
 assert.equal(reward.chapterThree.cacheTaken,true);
 assert.equal(takeTownSupplies(reward),reward);
 const restored=normalizeSave(reward);
 assert.equal(restored?.chapterThree.cacheTaken,true);
});
test('el episodio no altera la salida clásica de partidas F22',()=>{
 const old=ready();old.km=120;delete old.chapterThree;delete old.chapterFour;
 const restored=normalizeSave(old);assert.ok(restored);
 assert.equal(restored.chapterThree.stage,'locked');
 assert.equal(restored.chapterThree.legacyFinaleAllowed,true);
 assert.equal(shouldOfferFinale(restored),true);
 assert.equal(restored.campaign.completed.includes('nameless'),false);
});
test('el final de carretera requiere terminar III en partidas nuevas',()=>{
 const s={...ready(),km:120};
 assert.equal(shouldOfferFinale(s),false);
 const completed=concludeTown(toChoice(),'seal');
 assert.equal(shouldOfferFinale({...completed,km:120}),false);
 assert.equal(shouldOfferFinale({...completed,km:120,chapterFour:{...completed.chapterFour,stage:'complete'}}),true);
 assert.equal(travel(completed,24).chapterThree.stage,'complete');
});
test('guardar/cargar persiste clave errónea, Elías y guardián herido',()=>{
 let s=active();s=speakWitness(s,'doubt');s=readMemorial(s);s=restoreTownPower(s);
 s=readTownArchive(s);s=enterTownCode(s,'0404');s=enterTownCode(s,'0313');
 s=openTownChapel(s);s={...s,chapterThree:{...s.chapterThree,guardianHealth:43}};
 const restored=normalizeSave(JSON.parse(JSON.stringify(s)));
 assert.equal(restored?.chapterThree.stage,'guardian');
 assert.equal(restored?.chapterThree.attempts,1);
 assert.equal(restored?.chapterThree.witness,'doubt');
 assert.equal(restored?.chapterThree.guardianHealth,43);
 assert.equal(restored?.campaign.current,'nameless');
});
test('guardados manipulados no crean recompensas, hitos ni saltos',()=>{
 assert.deepEqual(normalizeChapterThree({stage:'nope',attempts:Infinity,guardianHealth:NaN,cacheTaken:1,witness:'nope'}),freshChapterThree());
 const s=normalizeSave({...fresh(),campaign:{current:'nameless',completed:['nameless'],milestones:[]},
  chapterThree:{stage:'ghost',guardianHealth:-200,decision:'seal'}});
 assert.equal(s?.campaign.current,'last-stop');
 assert.deepEqual(s?.campaign.completed,[]);
 assert.equal(s?.chapterThree.stage,'locked');
});
test('colisiones permiten recorrer la avenida sin atravesar edificios',()=>{
 assert.equal(townCollision(TOWN_LOCATIONS.entry.x,TOWN_LOCATIONS.entry.z),false);
 assert.equal(townCollision(TOWN_LOCATIONS.frequency.x,TOWN_LOCATIONS.frequency.z),false);
 assert.equal(townCollision(TOWN_LOCATIONS.chapel.x,TOWN_LOCATIONS.chapel.z),false);
 assert.equal(townCollision(32,-45),true);
 assert.equal(townCollision(0,-40),true);
 const walk=walkWithSlide(12,-30,0,-29,townCollision);
 assert.ok(walk.z<-55);assert.equal(townCollision(walk.x,walk.z),false);
});
test('radio de interacción impide recoger pistas desde kilómetros de distancia',()=>{
 for(const p of Object.values(TOWN_LOCATIONS)){
  assert.equal(nearTownObject(p.x,p.z,p),true);
  assert.equal(nearTownObject(p.x+10,p.z,p),false);
  assert.equal(nearTownObject(NaN,p.z,p),false);
 }
});
