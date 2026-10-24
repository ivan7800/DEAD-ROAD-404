import test from 'node:test';import assert from 'node:assert/strict';
import {FrameMetrics} from '../src/performance.ts';
test('60 FPS en ventana constante 16.67ms',()=>{const m=new FrameMetrics();for(let i=0;i<300;i++)m.add(1000/60);assert.ok(Math.abs(m.fps()-60)<.01);assert.equal(m.count(),120);});
test('ignora pausas de pestaña que distorsionan la muestra',()=>{const m=new FrameMetrics();m.add(16);m.add(6000);assert.equal(m.count(),1);assert.ok(m.fps()>60);});
test('reset limpia FPS y número de muestras',()=>{const m=new FrameMetrics();m.add(33);m.reset();assert.equal(m.fps(),0);assert.equal(m.count(),0);});
