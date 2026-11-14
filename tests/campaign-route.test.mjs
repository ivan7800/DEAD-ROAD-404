import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh, travel, pickFuel, normalizeSave} from '../src/state.ts';
import {advanceMission} from '../src/mission.ts';
import {resolveEncounter} from '../src/encounters.ts';
import * as one from '../src/chapterOne.ts';
import * as two from '../src/chapterTwo.ts';
import * as three from '../src/chapterThree.ts';
import * as four from '../src/chapterFour.ts';
import * as five from '../src/chapterFive.ts';
import * as six from '../src/chapterSix.ts';
import {resolveFinale} from '../src/roadStory.ts';

function reload(state) {
 const restored = normalizeSave(JSON.parse(JSON.stringify(state)));
 assert.ok(restored, 'El progreso de campaña debe sobrevivir a la recarga');
 return restored;
}

for (const [vera, town, radio, approach, ending] of [
 ['rescue', 'transmit', 'broadcast', 'escape', 'dawn'],
 ['take', 'transmit', 'broadcast', 'escape', 'toll'],
 ['rescue', 'seal', 'sever', 'listen', 'loop'],
 ['rescue', 'transmit', 'broadcast', 'listen', 'chorus'],
]) {
 test('campaña desde KM 0: '+ending, () => {
  let s = pickFuel(fresh());
  for (const [action, choice] of [['radio'], ['key'], ['talk', vera]]) {
   s.mission = advanceMission(s.mission, action, choice);
  }
  s = one.beginChapterOne(s);
  s = one.collectChapterFuse(s);
  s = one.powerChapterConsole(s);
  s = one.tuneChapterFrequency(s, 217);
  s = one.openChapterHatch(s);
  assert.equal(s.chapterOne.stage, 'fight');
  s.chapterOne.wardenHealth = 0;
  s = one.closeChapterOne(one.defeatChapterWarden(s), 'preserve');

  s = resolveEncounter(travel(reload(s)), 'leave');
  assert.equal(s.km, 24);
  s = two.beginDiner(s);
  s = two.readDinerTicket(s);
  s = two.restoreDinerNeon(s);
  s = two.readDinerLedger(s);
  s = two.tryDinerCode(s, 1992);
  s = two.openDinerFreezer(s);
  assert.equal(s.chapterTwo.stage, 'stalker');
  s.chapterTwo.stalkerHealth = 0;
  s = two.concludeDiner(two.defeatDinerThreat(s), 'broadcast');

  s = travel(reload(s));
  assert.equal(s.km, 48);
  s = three.beginTown(s);
  s = three.readMemorial(s);
  s = three.restoreTownPower(s);
  s = three.readTownArchive(s);
  s = three.enterTownCode(s, '0313');
  s = three.openTownChapel(s);
  assert.equal(s.chapterThree.stage, 'guardian');
  s.chapterThree.guardianHealth = 0;
  s = three.concludeTown(three.defeatTownGuardian(s), town);

  s = travel(reload(s));
  assert.equal(s.km, 72);
  s = four.beginRadio(s);
  s = four.inspectRadioSign(s);
  s = four.powerRadioRelay(s);
  s = four.readRadioArchive(s);
  s = four.tuneRadioMixer(s, '0217');
  s = four.openRadioBunker(s);
  s = four.decodeRadioBunker(s, '0313');
  s = four.disableRadioBreaker(s, 'A');
  s = four.disableRadioBreaker(s, 'B');
  assert.equal(s.chapterFour.stage, 'sentinel');
  s.chapterFour.operatorHealth = 0;
  s = four.concludeRadio(four.defeatRadioOperator(s), radio);

  s = travel(reload(s));
  assert.equal(s.km, 96);
  s = five.beginMile(s);
  s = five.inspectMileSign(s);
  s = five.inspectMileLog(s);
  s = five.activateMileBeacon(s, 'A');
  s = five.activateMileBeacon(s, 'B');
  s = five.tuneMileDial(s, '2496');
  assert.equal(s.chapterFive.stage, 'hunter');
  s.chapterFive.hunterHealth = 0;
  s = five.concludeMile(five.defeatMileHunter(s), 'remember');

  s = travel(reload(s));
  assert.equal(s.km, 120);
  s = six.beginRoadEnd(s);
  s = six.readEndSign(s);
  s = six.readEndLedger(s);
  s = six.enableEndRelay(s, 'A');
  s = six.enableEndRelay(s, 'B');
  s = six.enterEndCode(s, '1204');
  assert.equal(s.chapterSix.stage, 'double');
  s.chapterSix.doubleHealth = 0;
  s = reload(resolveFinale(six.defeatRoadDouble(s), approach));
  assert.equal(s.ending, ending);
  assert.equal(s.campaign.completed.length, 6);
  assert.deepEqual(resolveFinale(s, approach), s);
 });
}
