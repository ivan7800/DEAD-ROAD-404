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
 await page.locator('#art-status').filter({hasText:/MODELOS F19 CARGADOS|MODO DE RESERVA/}).waitFor({timeout:30000});
 assert.equal(errors.length,0,'Errores JS al iniciar: '+errors.join('; '));
 assert.equal(missing.length,0,'Recursos que no cargaron: '+missing.join('; '));
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
 await page.keyboard.press('m');
 await page.locator('#save').click();
 const saved=await page.evaluate(()=>localStorage.getItem('dead-road-404-f19-v2'));
 assert.ok(saved,'El botón Guardar no funciona');
 await page.locator('#new').click();
 await page.locator('#load').click();
 await page.locator('#toast').filter({hasText:'Partida recuperada'}).waitFor();
 assert.equal(errors.length,0,'Errores JS durante el juego: '+errors.join('; '));
 console.log('PASS Chromium: inicio, modelos, conducción '+velocity+' km/h, exploración, guardado y carga.');
}catch(error){console.error(error);console.error('Vite:',logs.slice(-3000));process.exitCode=1;}
finally{await browser?.close();try{if(process.platform==='win32')server.kill('SIGTERM');else process.kill(-server.pid,'SIGTERM');}catch{}server.stdout?.destroy();server.stderr?.destroy();}
