import test from 'node:test';
import assert from 'node:assert/strict';
import {freshDinerThreat,stepDinerThreat,strikeDinerThreat} from '../src/dinerThreat.ts';
import {DINER_POSITIONS} from '../src/chapterTwo.ts';
test('la Camarera Hueca descansa lejos del jugador y no golpea',()=>{
 const s=freshDinerThreat(),result=stepDinerThreat(s,50,50,.016);
 assert.deepEqual(result.threat,s);
 assert.equal(result.hit,false);
});
test('señal amarilla precede al único golpe posible por ciclo',()=>{
 let w=freshDinerThreat();
 let result=stepDinerThreat(w,DINER_POSITIONS.threat.x,DINER_POSITIONS.threat.z+1,.016);
 assert.equal(result.threat.phase,'windup');assert.equal(result.hit,false);w=result.threat;
 let hits=0;for(let i=0;i<25;i++){result=stepDinerThreat(w,-31,13,.1);hits+=Number(result.hit);w=result.threat;}
 assert.equal(hits,1);
});
test('alejarse durante el aviso evita el golpe',()=>{
 let w=stepDinerThreat(freshDinerThreat(),-31,13,.016).threat;
 let gotHit=false;
 for(let i=0;i<12;i++){const step=stepDinerThreat(w,-31,22,.1);gotHit||=step.hit;w=step.threat;}
 assert.equal(gotHit,false);
});
test('golpear exige alcance y mirar al enemigo',()=>{
 const s=freshDinerThreat();
 assert.equal(strikeDinerThreat(s,-31,14,Math.PI).hit,false);
 assert.equal(strikeDinerThreat(s,50,50,0).hit,false);
 assert.equal(strikeDinerThreat(s,-31,14,0).hit,true);
});
test('tres golpes de 30 derrotan al enemigo sin vida negativa',()=>{
 let w=freshDinerThreat();
 for(let i=0;i<3;i++)w=strikeDinerThreat(w,-31,14,0).threat;
 assert.equal(w.health,0);
 assert.equal(strikeDinerThreat(w,-31,14,0).hit,false);
 assert.equal(stepDinerThreat(w,-31,14,.1).hit,false);
});
test('segunda fase es más agresiva pero sigue anunciada',()=>{
 let w=freshDinerThreat(40);
 let result=stepDinerThreat(w,-31,13,.016);
 assert.equal(result.threat.phase,'windup');
 assert.ok(result.threat.timer>.5);
 result=stepDinerThreat(result.threat,-31,13,99);
 assert.equal(result.hit,false,'saltos largos se recortan a 0.1 s');
});
