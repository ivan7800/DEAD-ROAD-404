import test from 'node:test';import assert from 'node:assert/strict';
import {RADIO_POSITIONS} from '../src/chapterFour.ts';
import {freshRadioOperator,updateRadioOperator,strikeRadioOperator} from '../src/radioOperator.ts';
test('el Operador no se mueve ni ataca lejos del jugador',()=>{
 const s=freshRadioOperator(),step=updateRadioOperator(s,35,-40,.07);
 assert.deepEqual(step.operator,s);assert.equal(step.hit,false);
});
test('el pulso peligroso siempre se anuncia y respeta recuperación',()=>{
 let w=updateRadioOperator(freshRadioOperator(),-22,41,.016).operator;
 assert.equal(w.phase,'warn');let hits=0;
 for(let i=0;i<25;i++){const result=updateRadioOperator(w,-22,41,.1);w=result.operator;hits+=Number(result.hit);}
 assert.equal(hits,1);
});
test('alejarse durante el pulso evita el daño',()=>{
 let w=updateRadioOperator(freshRadioOperator(),-22,41,.016).operator;
 let hits=0;for(let i=0;i<12;i++){const result=updateRadioOperator(w,-22,32,.1);w=result.operator;hits+=Number(result.hit);}
 assert.equal(hits,0);
});
test('el arma exige alcanzar y mirar hacia la entidad',()=>{
 const w=freshRadioOperator();
 assert.equal(strikeRadioOperator(w,-22,39,0).hit,false);
 assert.equal(strikeRadioOperator(w,10,10,Math.PI).hit,false);
 assert.equal(strikeRadioOperator(w,-22,39,Math.PI).hit,true);
});
test('cinco golpes de 30 puntos derrotan al Operador',()=>{
 let w=freshRadioOperator();
 for(let i=0;i<5;i++)w=strikeRadioOperator(w,-22,39,Math.PI).operator;
 assert.equal(w.health,0);
 assert.equal(updateRadioOperator(w,-22,41,.1).hit,false);
 assert.equal(strikeRadioOperator(w,-22,39,Math.PI).hit,false);
});
test('segunda fase más rápida también avisa; delta grande no causa golpe instantáneo',()=>{
 let w=freshRadioOperator(60);
 const step=updateRadioOperator(w,-22,41,.01);
 assert.equal(step.telegraph,true);
 assert.equal(step.operator.phase,'warn');
 const after=updateRadioOperator(step.operator,-22,41,18);
 assert.equal(after.hit,false);
 assert.ok(after.operator.timer>.5);
});
