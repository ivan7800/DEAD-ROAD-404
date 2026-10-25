import test from 'node:test';import assert from 'node:assert/strict';
import {freshGuardian,updateGuardian,strikeGuardian} from '../src/townGuardian.ts';
import {TOWN_LOCATIONS} from '../src/chapterThree.ts';
test('el Campanero permanece quieto si el jugador está fuera de la zona',()=>{
 const w=freshGuardian(),r=updateGuardian(w,40,50,.05);
 assert.equal(r.hit,false);assert.deepEqual(r.guardian,w);
});
test('tiene aviso previo y no encadena golpes sin enfriamiento',()=>{
 let w=updateGuardian(freshGuardian(),TOWN_LOCATIONS.guardian.x,TOWN_LOCATIONS.guardian.z+1,.016).guardian;
 assert.equal(w.phase,'windup');
 let hits=0;
 for(let i=0;i<19;i++){const r=updateGuardian(w,15,-56,.1);w=r.guardian;hits+=Number(r.hit);}
 assert.equal(hits,1);
});
test('el aviso puede esquivarse alejándose',()=>{
 let w=updateGuardian(freshGuardian(),15,-56,.01).guardian;
 let damage=0;for(let i=0;i<11;i++){const r=updateGuardian(w,15,-42,.1);w=r.guardian;damage+=Number(r.hit);}
 assert.equal(damage,0);
});
test('el jugador debe mirar al enemigo y estar al alcance para golpear',()=>{
 const w=freshGuardian();
 assert.equal(strikeGuardian(w,15,-54,Math.PI).hit,false);
 assert.equal(strikeGuardian(w,30,-30,0).hit,false);
 assert.equal(strikeGuardian(w,15,-54,0).hit,true);
});
test('cuatro golpes correctos derrotan al guardián sin desbordar salud',()=>{
 let w=freshGuardian();for(let i=0;i<4;i++)w=strikeGuardian(w,15,-54,0).guardian;
 assert.equal(w.health,0);
 assert.equal(strikeGuardian(w,15,-54,0).hit,false);
 assert.equal(updateGuardian(w,15,-54,.1).hit,false);
});
test('segunda fase rápida sigue anunciando y dt grande no provoca golpe instantáneo',()=>{
 let w=freshGuardian(40);const r=updateGuardian(w,15,-56,.02);
 assert.equal(r.guardian.phase,'windup');
 assert.equal(r.telegraph,true);
 w=r.guardian;const long=updateGuardian(w,15,-56,12);
 assert.equal(long.hit,false);
 assert.ok(long.guardian.timer>.4);
});
