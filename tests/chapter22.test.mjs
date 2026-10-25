import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,normalizeSave,travel} from '../src/state.ts';
import {completeChapter,campaignStatus} from '../src/campaign.ts';
import {shouldOfferFinale} from '../src/roadStory.ts';
import {
 freshChapterTwo,normalizeChapterTwo,DINER_POSITIONS,dinerAvailable,beginDiner,dinerObjective,
 nearDinerProp,chooseMara,readDinerTicket,restoreDinerNeon,readDinerLedger,
 tryDinerCode,openDinerFreezer,defeatDinerThreat,concludeDiner
} from '../src/chapterTwo.ts';
import {dinerCollision} from '../src/dinerCollision.ts';
import {walkWithSlide} from '../src/worldCollision.ts';

const arrived=()=>{
 const first=completeChapter(fresh().campaign,'last-stop');
 return {...fresh(),mission:{stage:'resolved',choice:'rescue'},
  chapterOne:{...fresh().chapterOne,stage:'complete',wardenHealth:0},
  campaign:first,km:24,encounterResolved:true};
};
const started=()=>beginDiner(arrived());
const toFreezer=()=>{
 let s=started();s=readDinerTicket(s);s=restoreDinerNeon(s);s=readDinerLedger(s);
 return tryDinerCode(s,1992);
};
const toChoice=()=>{
 let s=openDinerFreezer(toFreezer());
 return defeatDinerThreat({...s,chapterTwo:{...s.chapterTwo,stalkerHealth:0}});
};

test('el restaurante permanece inaccesible antes de terminar I y KM 24',()=>{
 const s=fresh();assert.equal(dinerAvailable(s),false);
 assert.equal(beginDiner(s).chapterTwo.stage,'locked');
 assert.equal(dinerAvailable({...arrived(),km:23}),false);
 assert.equal(dinerAvailable(arrived()),true);
 assert.equal(dinerAvailable({...arrived(),ending:'loop'}),false);
});
test('llegada cambia capítulo a II, registra hito y no reinicia la misión',()=>{
 const s=started();assert.equal(s.chapterTwo.stage,'arrival');
 assert.equal(s.campaign.current,'missing');
 assert.ok(s.campaign.milestones.includes('diner'));
 assert.equal(beginDiner(s).chapterTwo.stage,'arrival');
 assert.equal(campaignStatus(s.campaign,'missing'),'active');
 assert.equal(campaignStatus(s.campaign,'nameless'),'locked');
});
test('Mara es una decisión única con consecuencia real y sin duplicaciones',()=>{
 const s=started(),trusted=chooseMara(s,'trust');
 assert.equal(trusted.food,s.food+2);
 assert.equal(trusted.chapterTwo.mara,'trust');
 assert.deepEqual(chooseMara(trusted,'trust'),trusted);
 const distrust=chooseMara(s,'avoid');assert.equal(distrust.food,s.food);
 assert.equal(chooseMara(fresh(),'trust'),fresh());
});
test('puzle completo: ticket, neón, libro, cuatro cifras y congelador',()=>{
 let s=started();
 assert.equal(readDinerLedger(s).chapterTwo.stage,'arrival');
 assert.equal(tryDinerCode(s,1992).chapterTwo.stage,'arrival');
 s=readDinerTicket(s);assert.equal(s.chapterTwo.stage,'breaker');
 s=restoreDinerNeon(s);assert.equal(s.chapterTwo.stage,'ledger');
 s=readDinerLedger(s);assert.equal(s.chapterTwo.stage,'code');
 const wrong=tryDinerCode(s,4040);
 assert.equal(wrong.chapterTwo.codeAttempts,1);
 assert.equal(wrong.chapterTwo.stage,'code');
 s=tryDinerCode(wrong,1992);
 assert.equal(s.chapterTwo.stage,'freezer');
 s=openDinerFreezer(s);assert.equal(s.chapterTwo.stage,'stalker');
 assert.equal(s.chapterTwo.stalkerHealth,90);
 assert.ok(s.campaign.milestones.includes('dinerKitchen'));
});
test('no salta el combate ni cierra el restaurante sin derrotar al enemigo',()=>{
 const s=openDinerFreezer(toFreezer());
 assert.equal(defeatDinerThreat(s),s);
 assert.equal(concludeDiner(s,'broadcast'),s);
 assert.match(dinerObjective(s),/CAMARERA HUECA/);
});
test('dos decisiones finales tienen recompensas acotadas y sólo se aplican una vez',()=>{
 const s=toChoice();assert.equal(s.chapterTwo.stage,'choice');
 const broadcast=concludeDiner({...s,fuel:78},'broadcast');
 assert.equal(broadcast.fuel,80);assert.equal(broadcast.chapterTwo.ending,'broadcast');
 assert.equal(broadcast.chapterTwo.stage,'complete');
 assert.equal(concludeDiner(broadcast,'broadcast'),broadcast);
 const silence=concludeDiner(s,'silence');
 assert.equal(silence.parts,s.parts+2);
 assert.equal(silence.chapterTwo.ending,'silence');
 assert.equal(campaignStatus(silence.campaign,'missing'),'completed');
 assert.equal(campaignStatus(silence.campaign,'nameless'),'locked');
 assert.equal(dinerObjective(silence),'');
});
test('el final de la carretera requiere completar II en partidas nuevas',()=>{
 const s={...arrived(),km:120};
 assert.equal(shouldOfferFinale(s),false);
 const conclusion=concludeDiner(toChoice(),'broadcast');
 assert.equal(shouldOfferFinale({...conclusion,km:120}),true);
});
test('guardar/cargar conserva intentos, salud enemiga, Mara y pista',()=>{
 let s=started();s=chooseMara(s,'trust');s=readDinerTicket(s);
 s=restoreDinerNeon(s);s=readDinerLedger(s);s=tryDinerCode(s,1984);
 s={...s,chapterTwo:{...s.chapterTwo,stalkerHealth:39}};
 const result=normalizeSave(JSON.parse(JSON.stringify(s)));
 assert.equal(result?.chapterTwo.stage,'code');
 assert.equal(result?.chapterTwo.codeAttempts,1);
 assert.equal(result?.chapterTwo.stalkerHealth,39);
 assert.equal(result?.chapterTwo.mara,'trust');
 assert.equal(result?.campaign.current,'missing');
});
test('los guardados F21 conservan el antiguo epílogo sin desbloquear falsamente II',()=>{
 const old={...arrived(),km:120};delete old.chapterTwo;
 const result=normalizeSave(old);assert.ok(result);
 assert.equal(result.chapterTwo.stage,'locked');
 assert.equal(result.chapterTwo.legacyFinaleAllowed,true);
 assert.equal(result.campaign.completed.includes('missing'),false);
 assert.equal(shouldOfferFinale(result),true);
});
test('save malformado se limpia sin inventar premios o atajos',()=>{
 const stage=normalizeChapterTwo({stage:'stalker',stalkerHealth:0,codeAttempts:Infinity,mara:'fake',legacyFinaleAllowed:2});
 assert.equal(stage.stage,'choice');
 assert.equal(stage.codeAttempts,0);
 assert.equal(stage.mara,null);assert.equal(stage.legacyFinaleAllowed,false);
 const s=normalizeSave({...fresh(),chapterTwo:{stage:'not-a-chapter',stalkerHealth:NaN,ending:'broadcast'}});
 assert.deepEqual(s?.chapterTwo,freshChapterTwo());
});
test('colisiones del restaurante detienen paredes y permiten entrar por la puerta central',()=>{
 assert.equal(dinerCollision(DINER_POSITIONS.entry.x,DINER_POSITIONS.entry.z),false);
 assert.equal(dinerCollision(-38.75,20),true);
 assert.equal(dinerCollision(-31,25.9),false);
 assert.equal(dinerCollision(-24,16),true);
 assert.equal(dinerCollision(-31,12.7),false);
 const point=walkWithSlide(-31,23,-15,0,dinerCollision);
 assert.ok(point.x>-38.5);
 assert.equal(dinerCollision(point.x,point.z),false);
});
test('distancias de interacción no permiten activar objetos desde lejos',()=>{
 for(const prop of Object.values(DINER_POSITIONS)){
  assert.equal(nearDinerProp(prop.x,prop.z,prop),true);
  assert.equal(nearDinerProp(prop.x+10,prop.z,prop),false);
  assert.equal(nearDinerProp(NaN,prop.z,prop),false);
 }
});
