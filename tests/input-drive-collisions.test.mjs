import test from 'node:test';
import assert from 'node:assert/strict';
import {InputController,normalizeKey,capturesGameKey} from '../src/inputController.ts';
import {EMPTY_DRIVE,stepArcadeDrive} from '../src/arcadeDrive.ts';
import {STATION_COLLIDERS,collides,walkWithSlide} from '../src/worldCollision.ts';
import {STATION_OBSTACLES} from '../src/combat.ts';
test('teclas liberadas sin estados fantasma al cambiar de escena',()=>{
 const i=new InputController();i.press('W');i.press('Space');assert.equal(i.axis(['w'],['s']),1);
 assert.equal(i.down(' '),true);i.release('Space');assert.equal(i.down(' '),false);
 i.reset();assert.equal(i.active(),0);assert.equal(normalizeKey('ArrowLeft'),'arrowleft');
});
test('se ignoran teclas de movimiento en mapa y se capturan conduciendo',()=>{
 assert.equal(capturesGameKey('w','map'),false);
 assert.equal(capturesGameKey('ArrowUp','drive'),true);
 assert.equal(capturesGameKey('F3','explore'),true);
});
test('motor accelera y se puede frenar y retroceder',()=>{
 let s={...EMPTY_DRIVE};for(let i=0;i<90;i++)s=stepArcadeDrive(s,{throttle:1,steer:0,handbrake:false},1/60);
 assert.ok(s.speed>10&&s.speed<=26,`velocidad ${s.speed}`);
 const fast=s.speed;for(let i=0;i<90;i++)s=stepArcadeDrive(s,{throttle:-1,steer:0,handbrake:false},1/60);
 assert.ok(s.speed<fast);for(let i=0;i<150;i++)s=stepArcadeDrive(s,{throttle:-1,steer:0,handbrake:false},1/60);
 assert.ok(s.speed<0&&s.speed>=-9);
});
test('freno de mano decelera y el giro se invierte marcha atras',()=>{
 const init={speed:19,heading:0,steering:0};
 const b=stepArcadeDrive(init,{throttle:0,steer:1,handbrake:true},.04);
 const c=stepArcadeDrive(init,{throttle:0,steer:1,handbrake:false},.04);
 assert.ok(b.speed<c.speed);assert.ok(b.heading>c.heading);
 const r=stepArcadeDrive({speed:-4,heading:0,steering:0},{throttle:-1,steer:1,handbrake:false},.05);
 assert.ok(r.heading<0);
});
test('física independiente del FPS dentro de una tolerancia acotada',()=>{
 const run=n=>{let s={...EMPTY_DRIVE};for(let i=0;i<n;i++)s=stepArcadeDrive(s,{throttle:1,steer:.4,handbrake:false},1/n);return s;};
 const a=run(30),b=run(120);assert.ok(Math.abs(a.speed-b.speed)<.2);
 assert.ok(Math.abs(a.heading-b.heading)<.02);
});
test('enemigo y jugador comparten geometria principal de colisiones',()=>{
 assert.deepEqual(STATION_OBSTACLES,STATION_COLLIDERS);
 assert.ok(collides(8,0));assert.equal(collides(15,1.4,.20),false);
 const r=walkWithSlide(13.5,2.5,0,-1.3);
 assert.ok(r.z>1.5,'No cruza fachada cerrada');
});
