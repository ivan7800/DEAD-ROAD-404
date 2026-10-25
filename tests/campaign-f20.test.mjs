import test from 'node:test';
import assert from 'node:assert/strict';
import {CHAPTERS,PLAYABLE_CHAPTERS,freshCampaign,recordMilestone,completeChapter,startChapter,canStartChapter,campaignStatus,normalizeCampaign} from '../src/campaign.ts';
import {fresh,normalizeSave,travel} from '../src/state.ts';
import {resolveFinale} from '../src/roadStory.ts';

test('seis capítulos distintos, solo el primero declarado jugable',()=>{
 assert.equal(CHAPTERS.length,6);
 assert.equal(new Set(CHAPTERS.map(c=>c.id)).size,6);
 assert.deepEqual([...PLAYABLE_CHAPTERS],['last-stop']);
 assert.equal(campaignStatus(freshCampaign(),'last-stop'),'active');
 for(const chapter of CHAPTERS.slice(1))assert.equal(campaignStatus(freshCampaign(),chapter.id),'locked');
});
test('no permite saltar a capítulos con localizaciones todavía no implementadas',()=>{
 const first=freshCampaign(),completed=completeChapter(first,'last-stop');
 assert.equal(canStartChapter(completed,'missing'),false);
 assert.deepEqual(startChapter(completed,'missing'),completed);
 assert.deepEqual(completeChapter(first,'road-end'),first);
});
test('los hitos y la conclusión son idempotentes e inmutables',()=>{
 const start=freshCampaign();const found=recordMilestone(start,'radio');
 assert.deepEqual(start.milestones,[]);
 assert.deepEqual(found.milestones,['radio']);
 assert.equal(recordMilestone(found,'radio'),found);
 const done=completeChapter(found,'last-stop');
 assert.equal(done.completed.length,1);
 assert.equal(completeChapter(done,'last-stop'),done);
});
test('se registran kilómetros y se guarda el progreso',()=>{
 const traveled=travel(fresh(),24);
 assert.ok(traveled.campaign.milestones.includes('road24'));
 assert.ok(normalizeSave(traveled)?.campaign.milestones.includes('road24'));
});
test('el desenlace completa el capítulo sin desbloquear capítulos ficticios',()=>{
 const s={...fresh(),km:120,mission:{stage:'resolved',choice:'rescue'},chapterOne:{...fresh().chapterOne,stage:'complete',wardenHealth:0},fuel:44,parts:3};
 const result=resolveFinale(s,'escape');
 assert.equal(result.ending,'dawn');
 assert.equal(campaignStatus(result.campaign,'last-stop'),'completed');
 assert.equal(campaignStatus(result.campaign,'missing'),'locked');
 assert.ok(result.campaign.milestones.includes('junction'));
});
test('migración F19 reconstruye pistas reales sin inventar desbloqueos',()=>{
 const old=fresh();delete old.campaign;delete old.inventory;delete old.supplyCacheTaken;
 old.visited=true;old.km=72;old.phoneHeard=true;old.motelTape=true;old.encounterResolved=true;
 old.mission={stage:'resolved',choice:'take'};
 const restored=normalizeSave(JSON.parse(JSON.stringify(old)));
 assert.ok(restored);
 for(const flag of ['station','radio','key','vera','phone','tape','road24','traveller'])
  assert.ok(restored.campaign.milestones.includes(flag),flag);
 assert.equal(restored.inventory.key404,1);
 assert.equal(restored.inventory.motelTape,1);
 assert.equal(restored.supplyCacheTaken,false);
 assert.equal(restored.campaign.completed.length,0);
});
test('un save antiguo con final recupera capítulo I completado',()=>{
 const old=fresh();delete old.campaign;old.ending='toll';
 const restored=normalizeSave(old);
 assert.deepEqual(restored?.campaign.completed,['last-stop']);
 assert.ok(restored?.campaign.milestones.includes('junction'));
});
test('corrige capítulos e hitos malformados sin perder el resto del guardado',()=>{
 const old={...fresh(),campaign:{current:'road-end',completed:['missing','last-stop','last-stop'],milestones:['radio','radio','invalid',9]}};
 const s=normalizeSave(old);
 assert.equal(s?.campaign.current,'last-stop');
 assert.deepEqual(s?.campaign.completed,['last-stop']);
 assert.deepEqual(s?.campaign.milestones,['radio']);
});
