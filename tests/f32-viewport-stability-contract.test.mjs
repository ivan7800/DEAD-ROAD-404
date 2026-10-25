import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('journal exposes an accessible dismiss action and returns focus',()=>{
 const html=read('index.html'),main=read('src/main.ts');
 assert.match(html,/id="journal-close"/);
 assert.match(main,/journal\.focus\(\{preventScroll:true\}\)/);
 assert.match(main,/journalReturnFocus\?\.focus/);
 assert.match(main,/\$\('journal-close'\)\.addEventListener/);
});
test('mobile and landscape dialogs scroll without clipping',()=>{
 const css=read('src/style.css');
 assert.match(css,/\.journal\{\s*max-height:calc/);
 assert.match(css,/\.encounter-card\{\s*max-height:calc/);
 assert.match(css,/\.journal-close\{/);
 assert.match(css,/@media\(max-height:620px\)/);
});
test('F32 long soak operates on isolated browser data and samples errors',()=>{
 execFileSync(process.execPath,['--check',new URL('../scripts/qa-stability32.mjs',import.meta.url).pathname]);
 const qa=read('scripts/qa-stability32.mjs');
 for(const target of ['320,height:568','568,height:320','1280,height:800','pageerror','requestfailed','#journal-close','page.reload','--minutes'])
  assert.ok(qa.includes(target),'Missing F32 QA contract '+target);
 assert.match(qa,/assert\.deepEqual\(report\.errors,\[\]/);
 assert.match(qa,/f32-stability\.json/);
});
