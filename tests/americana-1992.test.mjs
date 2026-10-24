import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,normalizeSave} from '../src/state.ts';
import {answerPhone,canAnswerPhone,isAtPhone,PHONE_POSITION} from '../src/phone1992.ts';

test('cabina cerca y fuera del rango',()=>{
 assert.equal(isAtPhone(PHONE_POSITION.x,PHONE_POSITION.z),true);
 assert.equal(isAtPhone(PHONE_POSITION.x+3.5,PHONE_POSITION.z),false);
 assert.equal(isAtPhone(Number.NaN,3),false);
});
test('cabina solo se activa después de la radio',()=>{
 assert.equal(canAnswerPhone('arrival',false),false);
 assert.equal(canAnswerPhone('signal',false),true);
 assert.equal(canAnswerPhone('key',false),true);
 assert.equal(canAnswerPhone('resolved',false),true);
 assert.equal(canAnswerPhone('signal',true),false);
});
test('primera llamada revela una pista, no recursos',()=>{
 const result=answerPhone('signal',false);
 assert.equal(result.heard,true);assert.match(result.message,/CABINA 404/);
 assert.equal(Object.keys(result).sort().join(','),'heard,message');
});
test('llamada anterior a la radio no desbloquea nada',()=>{
 const result=answerPhone('arrival',false);
 assert.equal(result.heard,false);
});
test('llamada repetida no ofrece segunda pista',()=>{
 assert.doesNotMatch(answerPhone('key',true).message,/CABINA 404/);
 assert.equal(answerPhone('key',true).heard,true);
});
test('guardados fase 12 migran phoneHeard sin cambiar version',()=>{
 const old=fresh();delete old.phoneHeard;
 const migrated=normalizeSave(JSON.parse(JSON.stringify(old)));
 assert.equal(migrated?.version,2);assert.equal(migrated?.phoneHeard,false);
});
test('estado de llamada persiste al cargar y rechaza tipos inválidos',()=>{
 const saved=fresh();saved.phoneHeard=true;
 assert.equal(normalizeSave(JSON.parse(JSON.stringify(saved)))?.phoneHeard,true);
 assert.equal(normalizeSave({...saved,phoneHeard:'sí'}),null);
});
