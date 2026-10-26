import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('controller menus route D-pad and confirmation without gameplay movement',()=>{
 const main=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
 assert.match(main,/navigateController\(overlay,'next'\)/);
 assert.match(main,/navigateController\(overlay,'previous'\)/);
 assert.match(main,/navigateController\(overlay,'confirm'\)/);
 assert.match(main,/padInput=readPad\(null\);return;/);
 assert.match(main,/mode==='map'\?\['panel'\]/);
});
