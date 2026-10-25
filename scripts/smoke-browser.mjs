/** Browser smoke test of the real production bundle, not a mocked game scene. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {chromium} from 'playwright';
import {mkdirSync} from 'node:fs';
const base='http://127.0.0.1:4173/DEAD-ROAD-404/';
const server=spawn('npm',['run','preview','--','--host','127.0.0.1','--port','4173','--strictPort'],{stdio:'pipe',detached:process.platform!=='win32',env:{...process.env,GITHUB_REPOSITORY:'ivan7800/DEAD-ROAD-404'}});
let logs='';for(const stream of [server.stdout,server.stderr])stream.on('data',buf=>{logs+=buf.toString();});
let browser;
async function waitForServer(){for(let i=0;i<75;i++){if(server.exitCode!==null)throw new Error('Vite terminó: '+logs);try{const response=await fetch(base);if(response.ok)return;}catch{}await sleep(200);}throw new Error('Vite no responde: '+logs);}
try{
 await waitForServer();
 browser=await chromium.launch({headless:true,args:['--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const missing=[];page.on('requestfailed',request=>missing.push(request.url()+': '+request.failure()?.errorText));
 const response=await page.goto(base,{waitUntil:'domcontentloaded'});
 assert.equal(response?.status(),200,'La página del juego no responde');
 await page.locator('#objective').filter({hasText:'Investiga'}).waitFor({timeout:20000});
 await page.locator('#art-status').filter({hasText:'ARTE PSX · 240P · SIN GLB PESADOS'}).waitFor({timeout:30000});
 const requestedModels=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.endsWith('.glb')).length);
 assert.equal(requestedModels,0,'El modo PSX no debe solicitar archivos GLB detallados');
 assert.equal(errors.length,0,'Errores JS al iniciar: '+errors.join('; '));
 assert.equal(missing.length,0,'Recursos que no cargaron: '+missing.join('; '));
 await page.keyboard.press('F3');
 await page.locator('#perf-panel').filter({hasText:'draw calls'}).waitFor({timeout:10000});
 const monitor=await page.locator('#perf-panel').innerText();
 assert.match(monitor,/DPR [0-9.]+/,'No se muestran datos de resolución real');
 const pixels=await page.evaluate(()=>{const c=document.querySelector('#scene');return c.width*c.height;});
 assert.ok(pixels<=110_000,'PSX 240p supera presupuesto de pixeles: '+pixels);
 console.log('RENDER DIAGNOSTIC · '+monitor);
 // Validate a real clickable inventory modal and campaign journal before gameplay.
 await page.locator('#inventory-open').click();
 await page.locator('#inventory-panel:not(.hidden)').waitFor();
 await page.locator('#inventory-list').filter({hasText:'BOTIQUÍN'}).waitFor();
 mkdirSync('artifacts',{recursive:true});await page.screenshot({path:'artifacts/inventario-f20.png'});
 await page.keyboard.press('i');
 await page.locator('#inventory-panel:not(.hidden)').waitFor({state:'hidden'});
 await page.keyboard.press('j');
 await page.locator('#journal-chapters').filter({hasText:'LA ÚLTIMA PARADA'}).waitFor();
 await page.locator('#journal-chapters').filter({hasText:'BLOQUEADO'}).waitFor();
 await page.screenshot({path:'artifacts/campana-f20.png'});
 await page.keyboard.press('j');
 await page.locator('#journal:not(.hidden)').waitFor({state:'hidden'});
 await page.locator('#drive').click();
 await page.locator('#dashboard.visible').waitFor();
 await page.keyboard.down('w');await sleep(850);await page.keyboard.up('w');
 mkdirSync('artifacts',{recursive:true});await page.screenshot({path:'artifacts/conduccion.png'});
 const velocity=Number(await page.locator('#speed-number').innerText());
 assert.ok(velocity>0,'El coche no ha acelerado');
 await page.keyboard.press('m');
 await page.locator('#explore').click();
 await page.locator('#status').filter({hasText:'EXPLORACIÓN'}).waitFor();
 await page.screenshot({path:'artifacts/exploracion.png'});
 // Reach and loot the in-world PSX cache through actual movement and [E].
 await page.keyboard.down('w');
 try{await page.locator('#prompt').filter({hasText:'REGISTRAR CAJA DE SUMINISTROS'}).waitFor({timeout:20000});}
 finally{await page.keyboard.up('w');}
 await page.keyboard.press('e');
 await page.locator('#toast').filter({hasText:'Caja SUNSPUR'}).waitFor({timeout:10000});
 await page.keyboard.press('i');
 await page.locator('#inventory-list').filter({hasText:'KIT DE REPARACIÓN'}).waitFor();
 await page.keyboard.press('i');
 await page.keyboard.press('m');
 await page.locator('#save').click();
 const saved=await page.evaluate(()=>localStorage.getItem('dead-road-404-f19-v2'));
 assert.ok(saved,'El botón Guardar no funciona');
 await page.locator('#new').click();
 await page.locator('#load').click();
 await page.locator('#toast').filter({hasText:'Partida recuperada'}).waitFor();
 // Consumption and save/load must be functional from actual UI, not only pure tests.
 await page.evaluate(()=>{
  const key='dead-road-404-f19-v2';
  const data=JSON.parse(localStorage.getItem(key));
  data.health=60;data.inventory={medkit:2,ration:0,repair:0,key404:0,motelTape:0};
  localStorage.setItem(key,JSON.stringify(data));
 });
 await page.locator('#load').click();
 await page.locator('#inventory-open').click();
 const useMedkit=page.locator('#inventory-list .inventory-item').filter({hasText:'BOTIQUÍN'}).locator('button');
 await useMedkit.click();
 await page.locator('#stats').filter({hasText:'♥ 95'}).waitFor();
 await page.locator('#inventory-list').filter({hasText:'BOTIQUÍN ×1'}).waitFor();
 await page.locator('#inventory-close').click();
 await page.locator('#load').click();
 await page.locator('#stats').filter({hasText:'♥ 95'}).waitFor();
 assert.equal(errors.length,0,'Errores JS durante el juego: '+errors.join('; '));
 console.log('PASS Chromium F20: PSX, capítulos, caja SUNSPUR recogida a pie, mochila, curación, conducción '+velocity+' km/h, exploración y guardado/carga.');
}catch(error){console.error(error);console.error('Vite:',logs.slice(-3000));process.exitCode=1;}
finally{await browser?.close();try{if(process.platform==='win32')server.kill('SIGTERM');else process.kill(-server.pid,'SIGTERM');}catch{}server.stdout?.destroy();server.stderr?.destroy();}
