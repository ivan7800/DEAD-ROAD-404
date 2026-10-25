import test from 'node:test';import assert from 'node:assert/strict';
import {fresh,normalizeSave,travel} from '../src/state.ts';
import {freshChapterOne,normalizeChapterOne,nearChapterProp,FUSE_POSITION,CONSOLE_POSITION,HATCH_POSITION,beginChapterOne,chapterOneObjective,collectChapterFuse,powerChapterConsole,tuneChapterFrequency,openChapterHatch,defeatChapterWarden,closeChapterOne} from '../src/chapterOne.ts';
import {shouldOfferFinale} from '../src/roadStory.ts';
import {campaignStatus} from '../src/campaign.ts';

const started=()=>beginChapterOne({...fresh(),mission:{stage:'resolved',choice:'rescue'}});
function toFight(){
 let s=started();s=collectChapterFuse(s);s=powerChapterConsole(s);s=tuneChapterFrequency(s,217);
 return openChapterHatch(s);
}
test('Capítulo I no se inicia sin hablar con Vera y no reabre al repetir',()=>{
 const s=fresh();assert.equal(beginChapterOne(s),s);
 const first=started();assert.equal(first.chapterOne.stage,'fuse');
 assert.equal(beginChapterOne(first),first);
 assert.match(chapterOneObjective(first),/FUSIBLE/);
});
test('puzle entero se desarrolla en orden, sin saltarse condiciones',()=>{
 let s=started();
 assert.equal(powerChapterConsole(s).chapterOne.stage,'fuse');
 assert.equal(openChapterHatch(s).chapterOne.stage,'fuse');
 s=collectChapterFuse(s);assert.equal(s.chapterOne.stage,'panel');
 assert.ok(s.campaign.milestones.includes('fuse'));
 assert.equal(collectChapterFuse(s).chapterOne.stage,'panel');
 s=powerChapterConsole(s);assert.equal(s.chapterOne.stage,'tuning');
 const wrong=tuneChapterFrequency(s,404);
 assert.equal(wrong.chapterOne.attempts,1);assert.equal(wrong.chapterOne.stage,'tuning');
 s=tuneChapterFrequency(wrong,217);assert.equal(s.chapterOne.stage,'hatch');
 assert.equal(s.chapterOne.attempts,1);
 s=openChapterHatch(s);assert.equal(s.chapterOne.stage,'fight');
 assert.equal(s.chapterOne.wardenHealth,120);
});
test('propiedades de interacción en PSX tienen radios acotados',()=>{
 for(const prop of [FUSE_POSITION,CONSOLE_POSITION,HATCH_POSITION]){
  assert.equal(nearChapterProp(prop.x,prop.z,prop),true);
  assert.equal(nearChapterProp(prop.x+10,prop.z,prop),false);
  assert.equal(nearChapterProp(NaN,prop.z,prop),false);
 }
});
test('derrota exige vida cero, decisión hace cierre y premia una vez',()=>{
 let s=toFight();
 assert.equal(defeatChapterWarden(s),s);
 s={...s,chapterOne:{...s.chapterOne,wardenHealth:0}};
 s=defeatChapterWarden(s);
 assert.equal(s.chapterOne.stage,'choice');
 assert.equal(s.campaign.milestones.includes('warden'),true);
 const destroy=closeChapterOne({...s,health:60},'destroy');
 assert.equal(destroy.chapterOne.stage,'complete');
 assert.equal(destroy.health,80);
 assert.equal(destroy.parts,s.parts);
 assert.equal(campaignStatus(destroy.campaign,'last-stop'),'completed');
 assert.equal(closeChapterOne(destroy,'destroy'),destroy);
 const preserve=closeChapterOne(s,'preserve');
 assert.equal(preserve.parts,s.parts+2);
 assert.equal(preserve.chapterOne.decision,'preserve');
});
test('fin de carretera no se dispara antes del desenlace del capítulo',()=>{
 let s={...started(),km:120,fuel:50,parts:5};
 assert.equal(shouldOfferFinale(s),false);
 s=collectChapterFuse(s);s=powerChapterConsole(s);s=tuneChapterFrequency(s,217);s=openChapterHatch(s);
 s=defeatChapterWarden({...s,chapterOne:{...s.chapterOne,wardenHealth:0}});
 s=closeChapterOne(s,'preserve');
 assert.equal(shouldOfferFinale(s),false);
 assert.equal(shouldOfferFinale({...s,chapterTwo:{...s.chapterTwo,stage:'complete'}}),false);
 assert.equal(shouldOfferFinale({...s,chapterTwo:{...s.chapterTwo,stage:'complete'},chapterThree:{...s.chapterThree,stage:'complete'}}),false);
 assert.equal(shouldOfferFinale({...s,chapterTwo:{...s.chapterTwo,stage:'complete'},chapterThree:{...s.chapterThree,stage:'complete'},chapterFour:{...s.chapterFour,stage:'complete'}}),true);
 assert.equal(travel(s,24).chapterOne.stage,'complete');
});
test('guardados F20 con misión terminada mantienen el final desbloqueado',()=>{
 const old={...fresh(),mission:{stage:'resolved',choice:'rescue'},km:120};delete old.chapterOne;delete old.chapterTwo;delete old.chapterThree;delete old.chapterFour;
 const restored=normalizeSave(old);assert.ok(restored);
 assert.equal(restored.chapterOne.stage,'complete');assert.equal(shouldOfferFinale(restored),true);
});
test('guardados antiguos anteriores a hablar con Vera conservan la ruta del puzle',()=>{
 const old=fresh();delete old.chapterOne;
 const restored=normalizeSave(old);
 assert.deepEqual(restored?.chapterOne,freshChapterOne());
});
test('guardado en mitad del jefe recupera vida, fase y decisiones',()=>{
 const s={...toFight(),chapterOne:{...toFight().chapterOne,wardenHealth:34}};
 const restored=normalizeSave(JSON.parse(JSON.stringify(s)));
 assert.equal(restored?.chapterOne.stage,'fight');
 assert.equal(restored?.chapterOne.wardenHealth,34);
 assert.equal(normalizeChapterOne({stage:'fight',wardenHealth:0},false).stage,'choice');
});
test('guardado manipulado no genera finales gratuitos ni desbloquea fases posteriores',()=>{
 const s=normalizeSave({...fresh(),chapterOne:{stage:'made-up',wardenHealth:9999,attempts:-3,decision:'fake'}});
 assert.deepEqual(s?.chapterOne,freshChapterOne());
 const legacy=normalizeSave({...fresh(),mission:{stage:'resolved',choice:'take'},chapterOne:{stage:'complete',wardenHealth:0,decision:'destroy'}});
 assert.equal(legacy?.chapterOne.decision,'destroy');
});
