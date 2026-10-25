import test from 'node:test';
import assert from 'node:assert/strict';
import {readLatestValidSave,readPreference,writePreference,writeSave,safeStorage} from '../src/saveStorage.ts';
import {fresh,normalizeSave} from '../src/state.ts';
import {walkWithSlide,collides} from '../src/worldCollision.ts';
test('guardado más reciente corrupto: rescata la versión anterior',()=>{
 const old={...fresh(),km:48};
 const data=new Map([['new','{broken'],['old',JSON.stringify(old)]]);
 const result=readLatestValidSave({getItem:k=>data.get(k)??null},['new','old'],normalizeSave);
 assert.equal(result?.km,48);
});
test('versión más reciente incompatible: recupera guardado válido',()=>{
 const old={...fresh(),km:24};
 const data=new Map([['new',JSON.stringify({version:999})],['old',JSON.stringify(old)]]);
 assert.equal(readLatestValidSave({getItem:k=>data.get(k)??null},['new','old'],normalizeSave)?.km,24);
});
test('almacenamiento bloqueado no rompe arranque ni guardado',()=>{
 const blocked={getItem(){throw new Error('SecurityError')},setItem(){throw new Error('QuotaExceededError')}};
 assert.equal(readLatestValidSave(blocked,['new','old'],normalizeSave),null);
 assert.equal(readPreference(blocked,'graphics'),null);
 assert.equal(writePreference(blocked,'graphics','alta'),false);
 assert.equal(writeSave(blocked,'save',fresh()),false);
 assert.equal(safeStorage(),null);
});
test('movimiento grande no atraviesa pared frontal de estación',()=>{
 const start={x:10,z:2.5};assert.equal(collides(start.x,start.z),false);
 const end=walkWithSlide(start.x,start.z,0,-10);
 assert.ok(end.z>1.5,'Pared atravesada');
});
test('movimiento diagonal se desliza por pared sin entrar en sólido',()=>{
 const end=walkWithSlide(13,2.4,4,-4);
 assert.equal(collides(end.x,end.z),false);
 assert.ok(end.x>13,'Se debería deslizar');
});
