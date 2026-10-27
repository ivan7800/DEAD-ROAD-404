import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {fresh,normalizeSave} from '../src/state.ts';
import {ROAD_EVENT_IDS,ROAD_EVENTS,pickRoadEvent,resolveRoadEvent,normalizeRoadEvents,freshRoadEvents} from '../src/roadEvents.ts';
const seq=(...v)=>{let i=0;return()=>v[Math.min(i++,v.length-1)];};
const at=(o={})=>({...fresh(),km:24,...o});
test('hay 6 eventos con 2-3 decisiones cada uno',()=>{assert.equal(ROAD_EVENT_IDS.length,6);for(const id of ROAD_EVENT_IDS){const n=ROAD_EVENTS[id].choices.length;assert.ok(n>=2&&n<=3)}});
test('el primer tramo (km 0) no tiene eventos',()=>{assert.equal(pickRoadEvent(fresh(),()=>0),null)});
test('la probabilidad respeta el rng y no repite el último',()=>{
 assert.equal(pickRoadEvent(at(),()=>.99),null);
 const s=at({roadEvents:{seen:[],count:1,last:'hitchhiker'}});
 for(let k=0;k<20;k++)assert.notEqual(pickRoadEvent(s,seq(0,k/20)),'hitchhiker');
});
test('favorece eventos no vistos',()=>{const seen=ROAD_EVENT_IDS.filter(i=>i!=='headlights');assert.equal(pickRoadEvent(at({roadEvents:{seen,count:5,last:null}}),seq(0,0)),'headlights')});
test('toda decisión de todo evento es válida, no muta y mantiene rangos',()=>{
 for(const id of ROAD_EVENT_IDS)for(const c of ROAD_EVENTS[id].choices)for(const r of [0,.99]){
  const s=at(),before=JSON.stringify(s);const out=resolveRoadEvent(s,id,c.id,()=>r);
  assert.equal(JSON.stringify(s),before);const n=out.state;
  assert.ok(n.health>=1&&n.health<=100&&n.fuel>=0&&n.fuel<=80&&n.carCondition>=0&&n.food>=0&&n.parts>=0);
  assert.ok(out.message.length>10);assert.equal(n.roadEvents.last,id);assert.equal(n.roadEvents.count,1);assert.deepEqual(n.roadEvents.seen,[id]);
 }});
test('nunca mata ni baja de 1 de salud',()=>{const out=resolveRoadEvent(at({health:3}),'roadkill','inspect',()=>.9);assert.equal(out.state.health,1)});
test('decisión inexistente no cambia nada',()=>{const s=at();assert.equal(resolveRoadEvent(s,'hitchhiker','xx',()=>0).state,s)});
test('efectos concretos',()=>{
 const a=resolveRoadEvent(at(),'hitchhiker','pickup',()=>.1).state;assert.equal(a.food,16);
 const b=resolveRoadEvent(at({fuel:40}),'abandoned-car','siphon',()=>0).state;assert.equal(b.fuel,50);
 const c=resolveRoadEvent(at({fuel:79}),'abandoned-car','siphon',()=>0).state;assert.equal(c.fuel,80);
});
test('COMPAT: guardado antiguo sin roadEvents carga con valores por defecto',()=>{
 const old=JSON.parse(JSON.stringify(fresh()));delete old.roadEvents;
 const s=normalizeSave(old);assert.ok(s);assert.deepEqual(s.roadEvents,freshRoadEvents());
});
test('guardado con roadEvents corrupto se sanea sin invalidar la partida',()=>{
 for(const bad of [null,5,'x',{seen:'a',count:'z',last:9},{seen:['nope','hitchhiker','hitchhiker'],count:-3,last:'nope'}]){
  const o=JSON.parse(JSON.stringify(fresh()));o.roadEvents=bad;const s=normalizeSave(o);assert.ok(s);
  assert.ok(s.roadEvents.count>=0&&s.roadEvents.last===null);
 }
 assert.deepEqual(normalizeRoadEvents({seen:['nope','hitchhiker','hitchhiker'],count:2,last:'headlights'}),{seen:['hitchhiker'],count:2,last:'headlights'});
});
test('ida y vuelta por guardado conserva el progreso',()=>{
 const n=resolveRoadEvent(at(),'wrong-sign','ignore',()=>0).state;
 assert.deepEqual(normalizeSave(JSON.parse(JSON.stringify(n))).roadEvents,n.roadEvents);
});
test('contrato: SAVE_KEY no cambia y la escena usa materiales PSX',()=>{
 const main=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8'),sc=readFileSync(new URL('../src/roadEventScene.ts',import.meta.url),'utf8');
 assert.match(main,/const SAVE_KEY='dead-road-404-f19-v2'/);
 assert.match(sc,/MeshStandardMaterial/);assert.doesNotMatch(sc,/Texture|PointLight|SpotLight|castShadow|EffectComposer/);
 assert.match(readFileSync(new URL('../src/scene.ts',import.meta.url),'utf8'),/this\.scene\.add\(this\.roadEventProps\.group\)/);
});
