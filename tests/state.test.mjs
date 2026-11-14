import test from 'node:test';import assert from 'node:assert/strict';import {fresh,travel,pickFuel,normalizeSave,clamp} from '../src/state.ts';
import {recoverAtFirebird} from '../src/campaignFlow.ts';
import {SceneTransition, SCENE_TRANSITIONS} from '../src/sceneTransition.ts';
test('partida inicial independiente',()=>{const a=fresh(),b=fresh();a.food=0;assert.equal(b.food,14);assert.equal(b.version,2)});
test('viajar consume comida y combustible',()=>{let s=travel(fresh());assert.equal(s.km,24);assert.equal(s.food,13);assert.ok(s.fuel<44)});
test('sin combustible no hay viaje',()=>{let s=fresh();s.fuel=0;let r=travel(s);assert.equal(r.km,0);assert.match(r.message,/combustible/)});
test('bidón solo se recoge una vez',()=>{let a=pickFuel(fresh()),b=pickFuel(a);assert.equal(a.fuel,72);assert.equal(b.fuel,72);assert.equal(b.parts,2)});
test('la salud cae al viajar sin comida',()=>{let s=fresh();s.food=0;assert.equal(travel(s).health,96)});
test('rechaza partidas incompatibles y malformadas',()=>{assert.equal(normalizeSave({version:1}),null);assert.equal(normalizeSave({version:2,mode:'map',fuel:Infinity}),null);assert.equal(normalizeSave(null),null)});
test('recupera guardado válido y acota recursos',()=>{let s=fresh();s.fuel=500;s.health=-30;let r=normalizeSave(JSON.parse(JSON.stringify(s)));assert.equal(r?.fuel,80);assert.equal(r?.health,0)});
test('clamp acota valores',()=>{assert.equal(clamp(-4,0,10),0);assert.equal(clamp(14,0,10),10)});

test('la transición cambia de escenario una sola vez bajo cobertura completa',()=>{
 const transition=new SceneTransition();
 let mode='drive';
 assert.equal(transition.start('bunker',()=>{mode='bunker';},true),true);
 assert.equal(transition.start('map',()=>{mode='map';},true),false);
 const {cover,reveal}=SCENE_TRANSITIONS.bunker;
 assert.equal(transition.advance(cover/2),.5);
 assert.equal(mode,'drive');
 assert.equal(transition.advance(cover+reveal),1);
 assert.equal(mode,'bunker');
 assert.equal(transition.advance(reveal/2),.5);
 assert.equal(transition.advance(reveal/2),0);
 assert.equal(transition.active,false);
});

test('movimiento reducido aplica el destino inmediatamente',()=>{
 const transition=new SceneTransition();
 transition.start('station',()=>{},true);
 transition.advance(SCENE_TRANSITIONS.station.cover);
 let destination='';
 transition.start('map',()=>{destination='map';},false);
 assert.equal(destination,'map');
 assert.equal(transition.active,false);
 assert.equal(transition.advance(500),0);
});

test('guardado reconcilia el índice de capítulos con la misión resuelta y los cierres',()=>{
 const s=fresh();
 s.mission={stage:'resolved',choice:'rescue'};
 s.chapterOne.stage='complete';
 s.chapterTwo.stage='complete';
 s.chapterTwo.ending='broadcast';
 s.campaign.completed=['last-stop'];
 const restored=normalizeSave(s);
 assert.deepEqual(restored.campaign.completed,['last-stop','missing']);
 assert.equal(restored.chapterTwo.ending,'broadcast');
 assert.equal(restored.chapterThree.legacyFinaleAllowed,false);
});

test('auxilio rescata una partida agotada sin reiniciar etapas ni regalar piezas',()=>{
 const s={...fresh(),health:0,fuel:0,carCondition:0,food:0,parts:0};
 const recovered=recoverAtFirebird(normalizeSave(s));
 assert.ok(recovered.health>0&&recovered.carCondition>0);
 assert.equal(recovered.food,0);
 assert.equal(recovered.parts,0);
 assert.deepEqual(recovered.chapterOne,s.chapterOne);
 assert.equal(travel(recovered).km,24);
 assert.equal(recoverAtFirebird(recovered),recovered);
});
