import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,normalizeSave,travel} from '../src/state.ts';
import {roadMessage,roadObjective,shouldOfferFinale,resolveFinale,ENDINGS} from '../src/roadStory.ts';
const ready=(choice='rescue')=>({...fresh(),mission:{stage:'resolved',choice},chapterOne:{...fresh().chapterOne,stage:'complete',wardenHealth:0},chapterTwo:{...fresh().chapterTwo,stage:'complete',stalkerHealth:0,ending:'silence'},km:120,fuel:40,parts:2});
test('cinco etapas de carretera con narrativa distinta',()=>{const m=[24,48,72,96,120].map(roadMessage);assert.equal(new Set(m).size,5);});
test('no ofrece final hasta completar misión y 120 km',()=>{
 assert.equal(shouldOfferFinale(fresh()),false);
 assert.equal(shouldOfferFinale({...ready(),km:96}),false);
 assert.equal(shouldOfferFinale({...ready(),mission:{stage:'key',choice:null}}),false);
 assert.equal(shouldOfferFinale(ready()),true);
});
test('tres finales según elección y recursos',()=>{
 assert.equal(resolveFinale(ready(),'escape').ending,'dawn');
 assert.equal(resolveFinale(ready('take'),'escape').ending,'toll');
 assert.equal(resolveFinale(ready(),'listen').ending,'loop');
 assert.equal(resolveFinale({...ready(),fuel:2},'escape').ending,'toll');
 assert.equal(Object.keys(ENDINGS).length,3);
});
test('los finales son persistentes y no se pueden explotar',()=>{
 const ended=resolveFinale(ready(),'escape');
 assert.equal(shouldOfferFinale(ended),false);
 assert.deepEqual(resolveFinale(ended,'listen'),ended);
 assert.equal(normalizeSave(ended)?.ending,'dawn');
});
test('guardados anteriores y objetivos de carretera',()=>{
 const old=fresh();delete old.ending;
 assert.equal(normalizeSave(old)?.ending,null);
 assert.match(roadObjective(ready()),/desvío/);
 assert.match(roadObjective(resolveFinale(ready(),'listen')),/FINAL REGISTRADO/);
});
test('narración del viaje se integra en travel',()=>{const s=travel(fresh(),24);assert.equal(s.message,roadMessage(24));});
