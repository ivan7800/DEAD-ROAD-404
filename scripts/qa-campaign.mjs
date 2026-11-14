// Complete routes through the production UI. F3 is read-only. Storage is read
// for assertions and is never seeded or modified by the test.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {chromium} from 'playwright';

const port=process.env.QA_CAMPAIGN_PORT??'4189';
const base='http://127.0.0.1:'+port+'/DEAD-ROAD-404/';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port',port,'--strictPort'],{
 env:{...process.env,GITHUB_REPOSITORY:'ivan7800/DEAD-ROAD-404'},stdio:'inherit'
});
const routes=process.argv.slice(2);
const endings=routes.length?routes:['dawn','toll','loop','chorus'];

async function play(browser,ending){
 const mobile=ending==='chorus';
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:800},reducedMotion:'reduce'});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.setDefaultTimeout(14000);
 const key=k=>page.keyboard.press(k);
 const click=id=>page.locator('#'+id).click();
 const button=name=>page.locator('#encounter-choices').getByRole('button',{name}).click();
 const dialog=(name)=>page.locator('#encounter:not(.hidden) #encounter-title').filter({hasText:name}).waitFor();
 const save=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')));
 const debug=page.locator('#perf-panel');
 const position=()=>debug.evaluate(el=>Object.fromEntries(Object.entries(el.dataset).map(([k,v])=>[k,Number(v)])));
 async function hold(keys,ms){
  for(const k of keys)await page.keyboard.down(k);
  await sleep(ms);
  for(const k of keys)await page.keyboard.up(k);
 }
 async function enter(id){
  await click(id);
  await page.locator('html[data-pulp-mode="explore"]').waitFor();
  if(!await debug.isVisible())await key('F3');
  await page.waitForFunction(()=>Number.isFinite(Number(document.querySelector('#perf-panel').dataset.yaw)));
 }
 async function walk(x,z,tolerance=0.85){
  let p;
  const deadline=Date.now()+45000;
  while(Date.now()<deadline){
   p=await position();
   const dx=x-p.playerX,dz=z-p.playerZ;
   const dist=Math.hypot(dx,dz);
   if(dist<tolerance)return;
   const f=dx*Math.sin(p.yaw)-dz*Math.cos(p.yaw),r=dx*Math.cos(p.yaw)+dz*Math.sin(p.yaw);
   const keys=[];
   if(Math.abs(f)>dist*.40)keys.push(f>0?'w':'s');
   if(Math.abs(r)>dist*.40)keys.push(r>0?'d':'a');
   await hold(keys,Math.min(1200,Math.max(12,dist*155)));
  }
  throw Error('No se alcanza '+[x,z]+' desde '+JSON.stringify(p)+' · '+await page.locator('#prompt').textContent());
 }
 async function use(x,z,hint,k='e'){
  await walk(x,z);
  await page.locator('#prompt').filter({hasText:hint}).waitFor();
  await key(k);
 }
 async function reload(id){
  await page.reload({waitUntil:'domcontentloaded'});
  await click('load');
  if(id)await enter(id);
 }
 async function fight(title){
  const deadline=Date.now()+45000;
  while(Date.now()<deadline){
   if(await page.locator('#encounter:not(.hidden) #encounter-title').filter({hasText:title}).isVisible())return;
   const p=await position();
   const dx=p.opponentX-p.playerX,dz=p.opponentZ-p.playerZ;
   const delta=Math.atan2(dx,-dz)-p.yaw;
   const turn=Math.atan2(Math.sin(delta),Math.cos(delta));
   if(Math.abs(turn)>.40){await hold([turn>0?'ArrowRight':'ArrowLeft'],Math.min(600,Math.abs(turn)*575));continue;}
   if(Math.hypot(dx,dz)>2.75){await hold(['w'],260);continue;}
   await key('f');
   await sleep(550);
  }
  throw Error('Combate sin resolución '+title+' · '+JSON.stringify(await position())+' · '+await page.locator('#stats').textContent());
 }
 async function trip(km){
  await click('drive');
  await page.locator('#dashboard.visible').waitFor();
  await page.keyboard.down('w');
  try{await page.locator('html[data-pulp-mode="map"]').waitFor({timeout:85000});}
  finally{await page.keyboard.up('w');}
  assert.equal((await save()).km,km);
  assert.ok((await page.locator('#road-briefing').textContent()).length>10);
 }
 async function closeChapter(choice){
  await button(choice);
  await dialog(/CAPÍTULO .* COMPLETADO/);
  await button(/REGRESAR AL FIREBIRD/);
  await page.locator('html[data-pulp-mode="map"]').waitFor();
 }
 try{
  await page.goto(base);
  await click('new');
  await button(/CONFIRMAR NUEVA PARTIDA/);
  assert.equal((await save()).km,0);
  await enter('explore');
  await use(9,5.4,'REGISTRAR CAJA');
  await use(11,3,'RECOGER BIDÓN');
  await walk(15,3);
  await use(15,-.2,'ESCUCHAR TRANSMISIÓN','r');
  await walk(16.2,-.6);
  await walk(17.95,-.7,.08);
  await walk(17.89,-.7,.055);
  await walk(17.89,-4.0,.07);
  await walk(17.89,-5.65,.07);
  await use(17.65,-6.9,'RECOGER LLAVE 404');
  await walk(17.89,-3.8,.07);
  await walk(17.95,-.7,.13);
  await walk(15,-.5);
  await walk(15,3);
  await walk(5,3);
  await walk(5,-13);
  await walk(-20,-29);
  await use(-20,-38,'HABLAR CON VERA');
  await button(ending==='dawn'?/Llevar a Vera/:/Cerrar la puerta/);
  await walk(-20,-26);
  await walk(5,-13);
  await walk(5,6);
  await use(25,7,'RECOGER FUSIBLE');
  await use(14,5,'INSERTAR FUSIBLE');
  await button('217 kHz');
  await walk(5,5);
  await walk(5,-13);
  await walk(-20,-29);
  await use(-20,-34.8,'ABRIR ESCOTILLA');
  await fight('LA ÚLTIMA TRANSMISIÓN');
  if(ending==='dawn'){await reload('explore');await key('e');await dialog('LA ÚLTIMA TRANSMISIÓN');}
  await closeChapter(/QUEMAR LA TRANSMISIÓN/);
  await trip(24);
  await dialog('CHAQUETA AMARILLA');
  await button(/ARRANCAR Y MARCHARSE/);
  console.log(ending+' · I');
  await enter('diner');
  await use(-35,21,'LEER PEDIDO');
  await use(-36,17,'INTERRUPTOR DE NEÓN');
  await use(-35,14.6,'LIBRO DE HUÉSPEDES');
  await use(-29,17,'CÓDIGO DE COCINA');
  await button('1992');
  await walk(-30,14);
  await walk(-30,11.9);
  await use(-29.3,10.5,'ABRIR CONGELADOR');
  await fight('ÚLTIMA MESA');
  if(ending==='dawn'){await reload('diner');await key('e');await dialog('ÚLTIMA MESA');}
  await closeChapter(/EMITIR LAS VOCES/);
  await trip(48);
  console.log(ending+' · II');
  await enter('town');
  await use(7,-36,'MONUMENTO');
  await use(24,-38,'GENERADOR');
  await use(24,-45,'ARCHIVO');
  await walk(23,-45);await walk(18,-45);
  await use(12,-48,'HORA DEL CAMPANARIO');
  await button('0313');
  await use(12,-54.8,'CAMPANARIO');
  await fight('LOS NOMBRES OLVIDADOS');
  await closeChapter(ending==='loop'?/SELLAR EL REGISTRO/:/TRANSMITIR LOS NOMBRES/);
  await trip(72);
  console.log(ending+' · III');
  await enter('radio');
  await use(-22,-35,'PLACA DE WXR');
  await use(-22,-38,'RELÉ DE ANTENA');
  await use(-22,-43,'CINTA MAESTRA');
  await use(-22,-48,'SINTONIZAR WXR');
  await button('0217');
  await use(-22,-53,'DESCENDER');
  await page.locator('#status').filter({hasText:'REFUGIO UMBRAL'}).waitFor();
  await use(-22,36.3,'TERMINAL UMBRAL');
  await button('0313');
  await use(-25.6,39.2,'CONTENCIÓN A');
  await use(-18.4,39.2,'CONTENCIÓN B');
  await fight('ÚLTIMO CANAL');
  await closeChapter(/EMITIR LOS NOMBRES/);
  await trip(96);
  console.log(ending+' · IV');
  await enter('mile');
  await use(0,-11.8,'POSTE KILOMÉTRICO');
  await use(0,-21,'REGISTRADOR');
  await use(-6,-31,'BALIZA A');
  await use(6,-31,'BALIZA B');
  await use(0,-42,'MARCADOR');
  await button('2496');
  await fight('EL MAPA QUE NO EXISTE');
  await closeChapter(/GUARDAR EL MAPA/);
  await trip(120);
  console.log(ending+' · V');
  await enter('road-end');
  await use(0,-10,'ÚLTIMA SEÑAL');
  await use(0,-20,'REGISTRO DE PEAJES');
  await use(-6,-30,'RELÉ A');
  await use(6,-30,'RELÉ B');
  await use(0,-42,'ABRIR BARRERA');
  await button('1204');
  await fight('ÚLTIMO DESVÍO');
  await button(ending==='chorus'||ending==='loop'?/ESCUCHAR LA RADIO/:/ABANDONAR LA CARRETERA/);
  assert.equal((await save()).ending,ending);
  await button(/VER CRÉDITOS/);
  await page.locator('#pulp-credits:not(.hidden)').waitFor();
  await click('pulp-credits-close');
  await reload();
  assert.equal((await save()).ending,ending);
  await key('j');
  await page.locator('#journal-record').filter({hasText:'Decisiones tomadas'}).waitFor();
  assert.deepEqual(errors,[]);
  console.log('PASS campaña KM 0–120 · '+ending+' · créditos y persistencia');
 }catch(error){
  console.error(ending,await page.locator('#status').textContent().catch(()=>''),await page.locator('#objective').textContent().catch(()=>''),await position().catch(()=>null),errors);
  throw error;
 }finally{await page.close();}
}

let browser;
try{
 for(let i=0;i<40;i++){
  try{if((await fetch(base)).ok)break;}catch{}
  if(i===39)throw Error('Vite no responde');
  await sleep(200);
 }
 browser=await chromium.launch({args:['--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
 for(const ending of endings)await play(browser,ending);
}finally{
 await browser?.close();
 server.kill();
}
