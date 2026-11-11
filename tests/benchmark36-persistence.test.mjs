import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Regression guard: threshold errors must occur only after both reports are written.
test('F36 preserves JSON and Markdown evidence before failing its FPS threshold',()=>{
 const source=readFileSync(new URL('../scripts/benchmark-gpu.mjs',import.meta.url),'utf8');
 const json=source.indexOf('writeFileSync(file,');
 const markdown=source.indexOf('writeFileSync(md,');
 const rejection=source.indexOf("if(failed.length)throw Error('F36 umbral");
 assert.ok(json>=0 && markdown>json && rejection>markdown);
 assert.match(source,/thresholdFailures:failed\.map/);
 assert.match(source,/f36-'\+stamp\+'\.json/);
});
