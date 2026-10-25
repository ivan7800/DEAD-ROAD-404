import test from 'node:test';import assert from 'node:assert/strict';
import {freshInventory,normalizeInventory,addItem,inventoryTotal,useItem,openSupplyCache} from '../src/inventory.ts';
import {fresh,normalizeSave} from '../src/state.ts';
test('inventario inicial independiente entre partidas',()=>{
 const a=fresh(),b=fresh();a.inventory.medkit=9;
 assert.equal(b.inventory.medkit,1);
 assert.equal(inventoryTotal(b.inventory),1);
});
test('botiquín consume una unidad y cura hasta 100',()=>{
 const s={...fresh(),health:72};
 const result=useItem(s,'medkit');
 assert.equal(result.used,true);assert.equal(result.state.health,100);
 assert.equal(result.state.inventory.medkit,0);
 assert.equal(s.inventory.medkit,1);
});
test('no desperdicia consumibles con salud o carrocería al máximo',()=>{
 const s=fresh();
 assert.equal(useItem(s,'medkit').used,false);
 assert.equal(useItem({...s,inventory:addItem(s.inventory,'repair')},'repair').used,false);
});
test('raciones y kits realizan acciones útiles en modo mapa',()=>{
 let s={...fresh(),food:0,carCondition:25,inventory:{...freshInventory(),ration:1,repair:1}};
 s=useItem(s,'ration').state;
 assert.equal(s.food,4);assert.equal(s.inventory.ration,0);
 s=useItem(s,'repair').state;
 assert.equal(s.carCondition,55);assert.equal(s.inventory.repair,0);
});
test('objetos de misión nunca desaparecen al pulsar usar',()=>{
 const s={...fresh(),inventory:addItem(freshInventory(),'key404')};
 const result=useItem(s,'key404');
 assert.equal(result.used,false);assert.equal(result.state.inventory.key404,1);
});
test('caja de SUNSPUR se puede registrar una sola vez sin duplicar materiales',()=>{
 const start=fresh(),first=openSupplyCache(start);
 assert.equal(first.opened,true);assert.equal(first.state.inventory.medkit,2);
 assert.equal(first.state.inventory.ration,1);assert.equal(first.state.inventory.repair,1);
 const again=openSupplyCache(first.state);
 assert.equal(again.opened,false);
 assert.deepEqual(again.state,first.state);
});
test('guardado conserva consumibles ya gastados y caja recogida',()=>{
 let s=openSupplyCache(fresh()).state;
 s={...s,health:60};s=useItem(s,'medkit').state;
 const restored=normalizeSave(JSON.parse(JSON.stringify(s)));
 assert.equal(restored?.supplyCacheTaken,true);
 assert.equal(restored?.inventory.medkit,1);
 assert.equal(restored?.health,95);
});
test('lectura defensiva de inventarios ajenos y cantidades enormes',()=>{
 const inv=normalizeInventory({medkit:999,ration:-8,repair:'no',key404:5,motelTape:0,hidden:99});
 assert.equal(inv.medkit,99);assert.equal(inv.ration,0);
 assert.equal(inv.repair,0);assert.equal(inv.key404,5);
 const copy=addItem(inv,'medkit',20);assert.equal(copy.medkit,99);
 assert.equal(inv.medkit,99);
});
test('estado antiguo conserva formato v2 y no pierde recursos existentes',()=>{
 const s=fresh();s.food=6;s.parts=4;delete s.inventory;delete s.campaign;
 const restored=normalizeSave(JSON.parse(JSON.stringify(s)));
 assert.equal(restored?.version,2);
 assert.equal(restored?.food,6);assert.equal(restored?.parts,4);
 assert.equal(restored?.inventory.medkit,1);
});
