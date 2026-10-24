import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const script=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
test('interfaz no declara IDs duplicados',()=>{const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);});
test('todos los controles referenciados existen en el HTML',()=>{const refs=[...script.matchAll(/\$\('([^']+)'\)/g)].map(m=>m[1]);const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));for(const id of refs)assert.ok(ids.has(id),`Falta #${id}`);});
test('lanzadores incluidos para ambos sistemas',()=>{for(const path of ['../INICIAR-WINDOWS.bat','../INICIAR-LINUX-MINT.sh','../scripts/abrir-cuando-listo.ps1'])assert.ok(existsSync(new URL(path,import.meta.url)),path);});
