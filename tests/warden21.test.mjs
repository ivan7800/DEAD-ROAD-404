import test from 'node:test';import assert from 'node:assert/strict';
import {freshWarden,stepWarden,strikeWarden} from '../src/warden.ts';
test('celador conserva posición de patrulla cuando no ve al jugador',()=>{
 const s=freshWarden();const n=stepWarden(s,100,100,.1);
 assert.equal(n.alert,false);assert.equal(n.hit,false);assert.deepEqual(n.warden,s);
});
test('el ataque anuncia primero su intención y deja margen para esquivar',()=>{
 let w=freshWarden();let n=stepWarden(w,-17,-30.5,.1);
 assert.equal(n.warden.phase,'telegraph');assert.equal(n.hit,false);
 w=n.warden;let hits=0;
 for(let i=0;i<20;i++){n=stepWarden(w,-17,-30.5,.1);w=n.warden;hits+=Number(n.hit);}
 assert.equal(hits,1,'una amenaza telegráfica solo puede causar un golpe');
 assert.ok(['recover','chase','telegraph'].includes(w.phase));
});
test('alejarse durante el aviso evita recibir daño',()=>{
 let w=stepWarden(freshWarden(),-17,-30.5,.1).warden;
 let hit=false;for(let i=0;i<10;i++){const n=stepWarden(w,-17,-15,.1);w=n.warden;hit||=n.hit;}
 assert.equal(hit,false);
});
test('el jugador debe mirar al celador y estar a distancia de golpe',()=>{
 const w=freshWarden();
 assert.equal(strikeWarden(w,-17,-29.5,Math.PI).hit,false);
 assert.equal(strikeWarden(w,60,60,0).hit,false);
 assert.equal(strikeWarden(w,-17,-29.5,0).hit,true);
});
test('cuatro golpes correctos derrotan al jefe sin vida negativa',()=>{
 let w=freshWarden();
 for(let i=0;i<4;i++)w=strikeWarden(w,-17,-29.5,0).warden;
 assert.equal(w.health,0);
 assert.equal(strikeWarden(w,-17,-29.5,0).hit,false);
 assert.equal(stepWarden(w,-17,-29.5,.1).hit,false);
});
test('la segunda fase acelera pero nunca omite el aviso',()=>{
 let w=freshWarden(50);
 let n=stepWarden(w,-17,-30.5,.1);assert.equal(n.hit,false);
 assert.equal(n.warden.phase,'telegraph');assert.ok(n.warden.timer>=.6);
 w=n.warden;n=stepWarden(w,-17,-30.5,99);
 assert.equal(n.hit,false,'delta grande siempre se limita a 0.1');
});
