import test from 'node:test';
import assert from 'node:assert/strict';
import {frameSummary,frameSummaryText} from '../scripts/benchmark-metrics.mjs';
test('60 FPS para intervalos regulares a 16,67ms',()=>{
 const x=frameSummary(Array.from({length:120},()=>1000/60));
 assert.equal(x.frames,120);assert.equal(x.meanFps,60);assert.equal(x.low1Fps,60);
 assert.match(frameSummaryText(x),/60.00 FPS/);
});
test('1% bajo refleja los peores intervalos y no el promedio instantáneo',()=>{
 const x=frameSummary([...Array.from({length:99},()=>16),200]);
 assert.ok(x.meanFps<60);assert.equal(x.low1Fps,5);assert.equal(x.p95FrameMs,16);
});
test('filtra muestras malformadas y maneja series vacías',()=>{
 assert.equal(frameSummary([NaN,-1,Infinity,0]).frames,0);
 assert.equal(frameSummary([0,16.6,Infinity]).frames,1);
 assert.deepEqual(frameSummary([]),{frames:0,meanFps:0,low1Fps:0,p95FrameMs:0,maxFrameMs:0});
});
