import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {driveFeedback} from '../src/drivingFeedback.ts';
import {applyHandbrake,brakeLampIntensity} from '../src/arcadeBrakes.ts';
import {normalizeFilmLook,toggleFilmLook,allowAnalogMotion} from '../src/filmLook.ts';
import {FrameMetrics} from '../src/performance.ts';

test('polvo de ruedas apagado en rendimiento y con coche detenido',()=>{
 assert.equal(driveFeedback(20,0,'rendimiento').particlesPerSecond,0);
 assert.equal(driveFeedback(0,0,'cine').particlesPerSecond,0);
 assert.ok(driveFeedback(20,0,'cine').particlesPerSecond>driveFeedback(20,0,'equilibrado').particlesPerSecond);
});
test('realimentación de volante y velocidad acotadas',()=>{
 assert.ok(driveFeedback(200,50,'cine').wheelLean<=.09);
 assert.ok(driveFeedback(-9,-1,'equilibrado').wheelLean<0);
 assert.equal(driveFeedback(NaN,NaN,'cine').particlesPerSecond,0);
});
test('freno de mano se comporta igual con frames pequeños o uno grande',()=>{
 const a=applyHandbrake(19,.04);const b=applyHandbrake(applyHandbrake(19,.02),.02);
 assert.ok(Math.abs(a-b)<.00001);assert.ok(a<19);
 assert.equal(applyHandbrake(-10,0),-10);assert.ok(applyHandbrake(-10,.05)>-10);
});
test('luces de freno activadas solo al frenar y tenues en reversa',()=>{
 assert.ok(brakeLampIntensity(true,false)>brakeLampIntensity(false,false));
 assert.ok(brakeLampIntensity(false,true)>brakeLampIntensity(false,false));
});
test('VHS puede deshabilitarse y respeta preferencia de movimiento reducido',()=>{
 assert.equal(normalizeFilmLook('desconocido'),'suave');assert.equal(toggleFilmLook('suave'),'apagado');
 assert.equal(toggleFilmLook('apagado'),'suave');assert.equal(allowAnalogMotion(true,true),false);
});
test('medidor informa 1% bajo de forma acotada',()=>{
 const fps=new FrameMetrics();assert.equal(fps.lowFps(),0);
 for(let i=0;i<100;i++)fps.add(i===5?40:16);
 assert.ok(fps.lowFps()<fps.fps());assert.ok(fps.lowFps()>20);
 fps.reset();assert.equal(fps.lowFps(),0);
});
test('contratos de integración: render 3D, estética y controles accesibles',()=>{
 const scene=fs.readFileSync('src/scene.ts','utf8');
 const main=fs.readFileSync('src/main.ts','utf8');
 const body=fs.readFileSync('src/vehicle.ts','utf8');
 const html=fs.readFileSync('index.html','utf8');
 assert.match(scene,/new RoadsideDetail14\(/);assert.match(scene,/new DriveDust\(/);
 assert.match(body,/addFirebirdDetails14\(c\)/);
 assert.match(main,/keys\.has\(' '\)/);assert.match(main,/applyFilmLook\(\)/);
 assert.match(html,/id="analog-overlay"/);
});
