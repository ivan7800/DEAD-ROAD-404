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
 // Use the opt-in F3 position readout; all movement still uses real keyboard input.
 async function walkTo(targetX,targetZ,tolerance=1.3,timeout=45000){
  // Reloading the page resets F3; enable telemetry before reading the player.
  const f3Hidden=await page.locator('#perf-panel').evaluate(el=>el.classList.contains('hidden'));
  if(f3Hidden)await page.keyboard.press('F3');
  // Keydown toggles F3 synchronously, but player coordinates appear on the next rAF.
  await page.waitForFunction(()=>{
   const el=document.getElementById('perf-panel');
   return el&&!el.classList.contains('hidden')&&
    Number.isFinite(Number(el.dataset.playerX))&&Number.isFinite(Number(el.dataset.playerZ));
  },null,{timeout:8000});
  const deadline=Date.now()+timeout;let lastPos='';
  while(Date.now()<deadline){
   const p=await page.locator('#perf-panel').evaluate(el=>({
    x:Number(el.dataset.playerX),z:Number(el.dataset.playerZ)
   }));
   if(!Number.isFinite(p.x)||!Number.isFinite(p.z))throw new Error('F3 no expone coordenadas válidas');
   lastPos=JSON.stringify(p);
   if(Math.abs(targetX-p.x)<tolerance&&Math.abs(targetZ-p.z)<tolerance)return;
   const dx=targetX-p.x,dz=targetZ-p.z;
   const side=Math.abs(dx)>tolerance?(dx>0?'d':'a'):null;
   const forward=Math.abs(dz)>tolerance?(dz<0?'w':'s'):null;
   if(side)await page.keyboard.down(side);
   if(forward)await page.keyboard.down(forward);
   await sleep(155);
   if(side)await page.keyboard.up(side);
   if(forward)await page.keyboard.up(forward);
   await sleep(65);
  }
  throw new Error('Ruta física no alcanzada '+targetX+','+targetZ+'; posición '+lastPos);
 }
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const missing=[];page.on('requestfailed',request=>missing.push(request.url()+': '+request.failure()?.errorText));
 const response=await page.goto(base,{waitUntil:'domcontentloaded'});
 assert.equal(response?.status(),200,'La página del juego no responde');
 await page.locator('#objective').filter({hasText:'Investiga'}).waitFor({timeout:20000});
 // Screen readers should hear objectives only when they change, not all HUD refreshes.
 const f28RepeatedAnnouncements=await page.evaluate(async()=>{
  const target=document.getElementById('objective');let n=0;
  const observer=new MutationObserver(()=>n++);
  observer.observe(target,{childList:true,characterData:true,subtree:true});
  await new Promise(resolve=>setTimeout(resolve,900));observer.disconnect();return n;
 });
 assert.equal(f28RepeatedAnnouncements,0,'La región viva del objetivo se reescribe sin cambios');
 await page.locator('#art-status').filter({hasText:'ARTE PSX · 240P · SIN GLB PESADOS'}).waitFor({timeout:30000});
 const requestedModels=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>r.name.endsWith('.glb')).length);
 assert.equal(requestedModels,0,'El modo PSX no debe solicitar archivos GLB detallados');
 assert.equal(errors.length,0,'Errores JS al iniciar: '+errors.join('; '));
 assert.equal(missing.length,0,'Recursos que no cargaron: '+missing.join('; '));
 // F24: new original 1992 main menu and fully functional screen controls.
 assert.match(await page.locator('#panel h1').innerText(),/DEAD ROAD 404/);
 await page.locator('#pulp-options-open').click();
 await page.locator('#pulp-options:not(.hidden)').waitFor();
 await page.locator('#pulp-graphics').selectOption('cine');
 await page.locator('#graphics-label').filter({hasText:'450P'}).waitFor();
 await page.locator('#pulp-graphics').selectOption('psx');
 await page.locator('#graphics-label').filter({hasText:'240P'}).waitFor();
 await page.locator('#pulp-high-contrast').check();
 assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('pulp-high-contrast')),true);
 await page.locator('#pulp-reduce-motion').check();
 assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('pulp-reduce-motion')),true);
 await page.locator('#pulp-large-text').check();
 assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('pulp-large-text')),true);
 await page.locator('#pulp-grain').uncheck();
 assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('pulp-grain')),false);
 await page.locator('#pulp-volume').evaluate(el=>{
  el.value='35';el.dispatchEvent(new Event('input',{bubbles:true}));
 });
 const optionsPersisted=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-pulp-ui-v1')));
 assert.equal(optionsPersisted.volume,35);
 assert.equal(optionsPersisted.highContrast,true);
 const optionsLayout=await page.evaluate(()=>{
  const panel=document.querySelector('#pulp-options .pulp-screen').getBoundingClientRect();
  const title=document.querySelector('#pulp-options h2').getBoundingClientRect();
  const close=document.querySelector('#pulp-options-close').getBoundingClientRect();
  return {panelTop:panel.top,panelBottom:panel.bottom,titleTop:title.top,closeBottom:close.bottom};
 });
 assert.ok(optionsLayout.titleTop>=optionsLayout.panelTop+30,'El título de opciones se corta: '+JSON.stringify(optionsLayout));
 assert.ok(optionsLayout.closeBottom<=optionsLayout.panelBottom-5,'Los controles de opciones quedan recortados: '+JSON.stringify(optionsLayout));
 mkdirSync('artifacts',{recursive:true});await page.screenshot({path:'artifacts/opciones-midnight-f24.png'});
 await page.locator('#pulp-reset-settings').click();
 await page.locator('#pulp-options-close').click();
 await page.locator('#pulp-options:not(.hidden)').waitFor({state:'hidden'});
 await page.locator('#pulp-chapters-open').click();
 await page.locator('#pulp-chapters:not(.hidden)').waitFor();
 assert.equal(await page.locator('#pulp-chapters-list article').count(),6,'Archivo debe contener seis rollos');
 await page.locator('#pulp-chapters-list').filter({hasText:'CINTA PRECINTADA'}).waitFor();
 const archiveLayout=await page.evaluate(()=>{
  const panel=document.querySelector('#pulp-chapters .pulp-screen').getBoundingClientRect();
  const title=document.querySelector('#pulp-chapters h2').getBoundingClientRect();
  const close=document.querySelector('#pulp-chapters-close').getBoundingClientRect();
  return {panelTop:panel.top,panelBottom:panel.bottom,titleTop:title.top,closeBottom:close.bottom};
 });
 assert.ok(archiveLayout.titleTop>=archiveLayout.panelTop+30,'El título del archivo se corta: '+JSON.stringify(archiveLayout));
 assert.ok(archiveLayout.closeBottom<=archiveLayout.panelBottom-5,'El botón cerrar del archivo no cabe: '+JSON.stringify(archiveLayout));
 await page.screenshot({path:'artifacts/archivo-capitulos-f24.png'});
 await page.keyboard.press('Escape');
 await page.locator('#pulp-chapters:not(.hidden)').waitFor({state:'hidden'});
 await page.locator('#pulp-credits-open').click();
 await page.locator('#pulp-credits:not(.hidden)').waitFor();
 await page.locator('#pulp-credits-close').click();
 await page.locator('#pulp-credits:not(.hidden)').waitFor({state:'hidden'});
 const poster=await page.evaluate(()=>{
  const panel=document.querySelector('#panel').getBoundingClientRect();
  const title=document.querySelector('#panel h1').getBoundingClientRect();
  const footer=document.querySelector('#pulp-credits-open').getBoundingClientRect();
  return {panelTop:panel.top,panelRight:panel.right,panelBottom:panel.bottom,
   titleTop:title.top,titleRight:title.right,buttonBottom:footer.bottom};
 });
 assert.ok(poster.titleTop>=poster.panelTop,'El logotipo principal se corta por arriba: '+JSON.stringify(poster));
 assert.ok(poster.titleRight<=poster.panelRight-10,'El logotipo principal sale del cartel: '+JSON.stringify(poster));
 assert.ok(poster.buttonBottom<=poster.panelBottom-5,'Botones recortados en el cartel: '+JSON.stringify(poster));
 await page.screenshot({path:'artifacts/portada-midnight-f24.png'});
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
 // F24 pause is an actual suspension of the game, not a decorative overlay.
 await page.keyboard.press('Escape');
 await page.locator('#pulp-pause:not(.hidden)').waitFor();
 const frozenSpeed=await page.locator('#speed-number').innerText();
 await sleep(250);
 assert.equal(await page.locator('#speed-number').innerText(),frozenSpeed,'El juego cambia mientras esta en pausa');
 await page.screenshot({path:'artifacts/pausa-cinta-f24.png'});
 await page.locator('#pulp-options-from-pause').click();
 await page.locator('#pulp-options:not(.hidden)').waitFor();
 await page.locator('#pulp-options-close').click();
 await page.locator('#pulp-pause:not(.hidden)').waitFor();
 await page.locator('#pulp-resume').click();
 await page.locator('#pulp-pause:not(.hidden)').waitFor({state:'hidden'});
 await page.keyboard.press('m');
 await page.locator('#explore').click();
 await page.locator('#status').filter({hasText:'EXPLORACIÓN'}).waitFor();
 await page.screenshot({path:'artifacts/exploracion.png'});
 // Journal must not swallow native arrow-key scrolling when playing with keyboard.
 await page.keyboard.press('j');
 await page.locator('#journal:not(.hidden)').waitFor();
 const f28ScrollAllowed=await page.evaluate(()=>{
  const e=new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true,cancelable:true});
  window.dispatchEvent(e);return !e.defaultPrevented;
 });
 assert.equal(f28ScrollAllowed,true,'El diario bloquea flechas del teclado e impide desplazar texto');
 await page.keyboard.press('j');
 await page.locator('#journal:not(.hidden)').waitFor({state:'hidden'});
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
 // F28: New Game must not silently discard a save, and confirmed reset must survive reload.
 await page.locator('#new').click();
 await page.locator('#encounter-title').filter({hasText:'REBOBINAR LA CINTA'}).waitFor();
 assert.equal(await page.evaluate(()=>localStorage.getItem('dead-road-404-f19-v2')),saved,
  'Abrir confirmación no debe sobrescribir el guardado');
 await page.keyboard.press('Tab');
 assert.equal(await page.evaluate(()=>document.activeElement?.textContent?.includes('CONFIRMAR NUEVA PARTIDA')),true,
  'Tab debe avanzar dentro del diálogo');
 await page.keyboard.press('Tab');
 assert.equal(await page.evaluate(()=>document.activeElement?.textContent?.includes('CANCELAR')),true,
  'El foco debe ciclar dentro del diálogo y no saltar al juego');
 await page.getByRole('button',{name:/CANCELAR · CONSERVAR PARTIDA/}).click();
 assert.equal(await page.evaluate(()=>localStorage.getItem('dead-road-404-f19-v2')),saved,
  'Cancelar debe preservar la partida anterior');
 await page.locator('#new').click();
 await page.keyboard.press('Escape');
 await page.locator('#encounter:not(.hidden)').waitFor({state:'hidden'});
 assert.equal(await page.evaluate(()=>localStorage.getItem('dead-road-404-f19-v2')),saved,
  'Escape en confirmación debe conservar la partida');
 await page.locator('#new').click();
 await page.getByRole('button',{name:'CONFIRMAR NUEVA PARTIDA'}).click();
 const f28Fresh=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')));
 assert.equal(f28Fresh.km,0);
 assert.equal(f28Fresh.visited,false);
 assert.equal(f28Fresh.campaign.completed.length,0);
 await page.reload({waitUntil:'domcontentloaded'});
 await page.locator('#art-status').filter({hasText:'ARTE PSX · 240P'}).waitFor();
 await page.locator('#load').click();
 await page.locator('#toast').filter({hasText:'Partida recuperada'}).waitFor();
 const f28Loaded=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')));
 assert.equal(f28Loaded.km,0,'Nueva partida no persistió al recargar');
 // Restore the earlier authenticated checkpoint for the rest of the campaign smoke.
 await page.evaluate(raw=>localStorage.setItem('dead-road-404-f19-v2',raw),saved);
 await page.locator('#load').click();
 assert.equal(await page.evaluate(()=>localStorage.getItem('dead-road-404-f19-v2')),saved);
 await page.locator('#show-controls').click();
 await page.locator('#controls-guide:not(.hidden)').waitFor();
 await page.keyboard.press('Tab');
 assert.equal(await page.evaluate(()=>document.getElementById('controls-guide')?.contains(document.activeElement)),true,
  'Guía de ayuda debe mantener el foco en el diálogo');
 await page.locator('#close-controls').click();
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
 // Chapter-I sequence must work in the actual rendered production bundle.
 // Load a valid checkpoint immediately after Vera to avoid a many-minute path in CI.
 await page.evaluate(()=>{
  const key='dead-road-404-f19-v2',data=JSON.parse(localStorage.getItem(key));
  data.mission={stage:'resolved',choice:'rescue'};
  data.chapterOne={stage:'tuning',attempts:0,wardenHealth:120,decision:null};
  data.encounterResolved=true;data.km=0;
  localStorage.setItem(key,JSON.stringify(data));
 });
 await page.locator('#load').click();
 await page.locator('#objective').filter({hasText:'Sintoniza el cuadro de radio'}).waitFor();
 await page.locator('#explore').click();
 // Spawn at (6,6), facing east: approach relay console at (14,5) on foot.
 await page.keyboard.down('w');
 try{await page.locator('#prompt').filter({hasText:'SINTONIZAR RADIO 02:17'}).waitFor({timeout:30000});}
 finally{await page.keyboard.up('w');}
 await page.keyboard.press('e');
 await page.locator('#encounter:not(.hidden)').waitFor();
 await page.locator('#encounter-title').filter({hasText:'FRECUENCIA'}).waitFor();
 await page.screenshot({path:'artifacts/puzle-radio-f21.png'});
 await page.getByRole('button',{name:'404 kHz'}).click();
 await page.locator('#encounter-text').filter({hasText:'No es un kilómetro'}).waitFor();
 await page.getByRole('button',{name:'217 kHz'}).click();
 await page.locator('#encounter:not(.hidden)').waitFor({state:'hidden'});
 await page.locator('#objective').filter({hasText:'registro frente al motel'}).waitFor();
 await page.keyboard.press('m');await page.locator('#load').click();
 await page.locator('#objective').filter({hasText:'registro frente al motel'}).waitFor();
 const storySave=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')));
 assert.equal(storySave.chapterOne.stage,'hatch');
 assert.equal(storySave.chapterOne.attempts,1);

 // Phase 22: validate the second real 3D location and a production keypad interaction.
 // The checkpoint is representative of a legitimately completed chapter I, preserving
 // the actual gameplay navigation, modal input and save round-trip for chapter II.
 await page.evaluate(()=>{
  const key='dead-road-404-f19-v2',s=JSON.parse(localStorage.getItem(key));
  s.km=24;s.ending=null;s.encounterResolved=true;
  s.mission={stage:'resolved',choice:'rescue'};
  s.chapterOne={stage:'complete',attempts:0,wardenHealth:0,decision:'destroy'};
  s.campaign.completed=['last-stop'];s.campaign.current='last-stop';
  s.chapterTwo={stage:'code',codeAttempts:0,stalkerHealth:90,mara:'avoid',ending:null,legacyFinaleAllowed:false};
  localStorage.setItem(key,JSON.stringify(s));
 });
 await page.locator('#load').click();
 await page.locator('#objective').filter({hasText:'año del ticket'}).waitFor({timeout:10000});
 assert.equal(await page.locator('#diner').isEnabled(),true,'Capítulo II no se desbloquea tras I y KM24');
 await page.locator('#diner').click();
 await page.locator('#status').filter({hasText:'THE LAST LIGHT'}).waitFor({timeout:10000});
 await page.screenshot({path:'artifacts/restaurante-f22.png'});
 // Navigate along the diner aisle using the on-screen prompt as the stop signal.
 // Timed key presses were flaky on CI machines where software WebGL varies in FPS.
 await page.keyboard.down('d');await sleep(750);await page.keyboard.up('d');
 await page.keyboard.down('w');
 try{await page.locator('#prompt').filter({hasText:'INTRODUCIR CÓDIGO DE COCINA'}).waitFor({timeout:30000});}
 finally{await page.keyboard.up('w');}
 await page.keyboard.press('e');
 await page.locator('#encounter-title').filter({hasText:'PUERTA DE COCINA'}).waitFor();
 await page.screenshot({path:'artifacts/codigo-restaurante-f22.png'});
 await page.getByRole('button',{name:'4040',exact:true}).click();
 await page.locator('#encounter-text').filter({hasText:'CÓDIGO 4040 INCORRECTO'}).waitFor();
 await page.getByRole('button',{name:'1992',exact:true}).click();
 await page.locator('#encounter:not(.hidden)').waitFor({state:'hidden'});
 await page.locator('#objective').filter({hasText:'Abre el congelador'}).waitFor();
 await page.keyboard.press('m');
 await page.locator('#load').click();
 const dinerSave=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')));
 assert.equal(dinerSave.chapterTwo.stage,'freezer');
 assert.equal(dinerSave.chapterTwo.codeAttempts,1);
 assert.equal(dinerSave.campaign.current,'missing');

 // F23: actual Chromium/WebGL exploration in a distinct original PSX town.
 // A legitimate chapter-II-complete save is injected to keep CI deterministic;
 // the navigation, UI, physics and code buttons remain fully interactive.
 await page.evaluate(()=>{
  const key='dead-road-404-f19-v2',s=JSON.parse(localStorage.getItem(key));
  s.km=48;s.ending=null;s.encounterResolved=true;
  s.mission={stage:'resolved',choice:'rescue'};
  s.chapterOne={stage:'complete',attempts:0,wardenHealth:0,decision:'destroy'};
  s.chapterTwo={stage:'complete',codeAttempts:1,stalkerHealth:0,mara:'avoid',ending:'silence',legacyFinaleAllowed:false};
  s.campaign.completed=['last-stop','missing'];s.campaign.current='missing';
  s.chapterThree={stage:'frequency',witness:'doubt',attempts:0,guardianHealth:120,cacheTaken:false,decision:null,legacyFinaleAllowed:false};
  localStorage.setItem(key,JSON.stringify(s));
 });
 await page.locator('#load').click();
 await page.locator('#objective').filter({hasText:'hora congelada del campanario'}).waitFor({timeout:12000});
 assert.equal(await page.locator('#town').isEnabled(),true,'El capítulo III sigue bloqueado tras completar II y KM48');
 await page.locator('#town').click();
 await page.locator('#status').filter({hasText:'EL PUEBLO SIN NOMBRE'}).waitFor({timeout:10000});
 await page.screenshot({path:'artifacts/pueblo-sin-nombre-f23.png'});
 await page.keyboard.down('w');
 try{await page.locator('#prompt').filter({hasText:'INTRODUCIR HORA DEL CAMPANARIO'}).waitFor({timeout:30000});}
 finally{await page.keyboard.up('w');}
 await page.keyboard.press('e');
 await page.locator('#encounter-title').filter({hasText:'RELOJ DEL CAMPANARIO'}).waitFor();
 await page.screenshot({path:'artifacts/reloj-0313-f23.png'});
 await page.getByRole('button',{name:'0404',exact:true}).click();
 await page.locator('#encounter-text').filter({hasText:'CÓDIGO 0404 INCORRECTO'}).waitFor();
 await page.getByRole('button',{name:'0313',exact:true}).click();
 await page.locator('#encounter:not(.hidden)').waitFor({state:'hidden'});
 await page.locator('#objective').filter({hasText:'Entra al campanario'}).waitFor();
 await page.keyboard.press('m');await page.locator('#load').click();
 const townSave=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')));
 assert.equal(townSave.chapterThree.stage,'chapel');
 assert.equal(townSave.chapterThree.attempts,1);
 assert.equal(townSave.campaign.current,'nameless');

 // F25: Chromium navigation in both original PSX scenes and both real cipher modals.
 // Valid chapter-III checkpoint avoids replaying three bosses for every CI build.
 await page.evaluate(()=>{
  const key='dead-road-404-f19-v2',s=JSON.parse(localStorage.getItem(key));
  s.km=72;s.ending=null;s.encounterResolved=true;
  s.mission={stage:'resolved',choice:'rescue'};
  s.chapterOne={stage:'complete',attempts:0,wardenHealth:0,decision:'destroy'};
  s.chapterTwo={stage:'complete',codeAttempts:1,stalkerHealth:0,mara:'avoid',ending:'silence',legacyFinaleAllowed:false};
  s.chapterThree={stage:'complete',witness:'doubt',attempts:1,guardianHealth:0,cacheTaken:false,decision:'seal',legacyFinaleAllowed:false};
  s.campaign.completed=['last-stop','missing','nameless'];s.campaign.current='nameless';
  s.chapterFour={stage:'tuning',nora:'refuse',attempts:0,subcodeAttempts:0,
   breakersMask:0,operatorHealth:150,cacheTaken:false,decision:null,legacyFinaleAllowed:false};
  localStorage.setItem(key,JSON.stringify(s));
 });
 await page.locator('#load').click();
 await page.locator('#objective').filter({hasText:'mezclador'}).waitFor({timeout:12000});
 assert.equal(await page.locator('#radio').isEnabled(),true,'WXR-404 debe desbloquearse en KM72 tras concluir III');
 await page.locator('#radio').click();
 await page.locator('#status').filter({hasText:'WXR-404'}).waitFor({timeout:12000});
 await page.screenshot({path:'artifacts/emisora-wxr404-f25.png'});
 await page.keyboard.down('w');
 try{await page.locator('#prompt').filter({hasText:'SINTONIZAR WXR-404'}).waitFor({timeout:30000});}
 finally{await page.keyboard.up('w');}
 await page.keyboard.press('e');
 await page.locator('#encounter-title').filter({hasText:'MESA DE MEZCLAS'}).waitFor({timeout:10000});
 await page.screenshot({path:'artifacts/mezclador-f25.png'});
 await page.getByRole('button',{name:'1992',exact:true}).click();
 await page.locator('#encounter-text').filter({hasText:'CÓDIGO 1992 INVÁLIDO'}).waitFor();
 await page.getByRole('button',{name:'0217',exact:true}).click();
 await page.locator('#encounter:not(.hidden)').waitFor({state:'hidden'});
 await page.locator('#objective').filter({hasText:'Abre la escotilla'}).waitFor();
 await page.keyboard.down('w');
 try{await page.locator('#prompt').filter({hasText:'DESCENDER AL REFUGIO UMBRAL'}).waitFor({timeout:30000});}
 finally{await page.keyboard.up('w');}
 await page.keyboard.press('e');
 await page.locator('#status').filter({hasText:'REFUGIO UMBRAL'}).waitFor({timeout:12000});
 await page.screenshot({path:'artifacts/refugio-umbral-f25.png'});
 await page.keyboard.down('w');
 try{await page.locator('#prompt').filter({hasText:'DESCIFRAR TERMINAL UMBRAL'}).waitFor({timeout:30000});}
 finally{await page.keyboard.up('w');}
 await page.keyboard.press('e');
 await page.locator('#encounter-title').filter({hasText:'TERMINAL DE CONTENCIÓN'}).waitFor({timeout:10000});
 await page.getByRole('button',{name:'0000',exact:true}).click();
 await page.locator('#encounter-text').filter({hasText:'NO RECONOCIDO'}).waitFor();
 await page.getByRole('button',{name:'0313',exact:true}).click();
 await page.locator('#encounter:not(.hidden)').waitFor({state:'hidden'});
 await page.locator('#objective').filter({hasText:'DOS interruptores'}).waitFor();
 await page.screenshot({path:'artifacts/circuitos-umbral-f25.png'});
 // F25 final chapter route: physically reach both distinct switches in the
 // underground corridor, defeat the 150-HP Operator with real strikes, select a
 // finale and prove its idempotent save/load. No source-state shortcuts.
 await page.keyboard.down('w');await page.keyboard.down('d');
 try{await page.locator('#prompt').filter({hasText:'CONTENCIÓN A'}).waitFor({timeout:30000});}
 finally{await page.keyboard.up('w');await page.keyboard.up('d');}
 await page.keyboard.press('e');
 await page.locator('#objective').filter({hasText:'DOS interruptores'}).waitFor();
 const switchA=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')).chapterFour);
 assert.equal(switchA.breakersMask,1,'El circuito A no se desconectó');
 // The first switch is reachable before fully entering the breaker row.
 // Advance along the aisle before strafing across to B (same z=39.2).
 await page.keyboard.down('w');await sleep(460);await page.keyboard.up('w');
 await page.keyboard.down('a');
 try{await page.locator('#prompt').filter({hasText:'CONTENCIÓN B'}).waitFor({timeout:30000});}
 finally{await page.keyboard.up('a');}
 await page.keyboard.press('e');
 await page.locator('#objective').filter({hasText:'EL OPERADOR'}).waitFor();
 const both=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')).chapterFour);
 assert.equal(both.breakersMask,3,'Los dos circuitos deben estar desconectados');
 await page.screenshot({path:'artifacts/operador-combate-f25.png'});
 // The game now presents the Operator by turning the camera towards it.
 // Move forward *towards the boss* instead of blindly strafing at the wall.
 await page.keyboard.down('w');await sleep(540);await page.keyboard.up('w');
 let operatorDefeated=false;
 for(let attempt=0;attempt<13;attempt++){
  await page.keyboard.press('f');await sleep(560);
  if(await page.locator('#encounter-title').filter({hasText:'ÚLTIMO CANAL'}).isVisible()){
   operatorDefeated=true;break;
  }
 }
 const operatorHealthAtEnd=(await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')).chapterFour.operatorHealth));
 assert.equal(operatorDefeated,true,'El combate real no termina tras 13 ataques; HP restantes='+operatorHealthAtEnd+
  ' · prompt='+await page.locator('#prompt').innerText());
 await page.screenshot({path:'artifacts/operador-derrotado-f25.png'});
 await page.getByRole('button',{name:/CORTAR EL ENLACE UMBRAL/}).click();
 await page.locator('#encounter-title').filter({hasText:'CAPÍTULO IV COMPLETADO'}).waitFor();
 await page.getByRole('button',{name:/REGRESAR AL FIREBIRD/}).click();
 await page.locator('#status').filter({hasText:'CARRETERA'}).waitFor();
 const radioFinal=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')));
 assert.equal(radioFinal.chapterFour.stage,'complete');
 assert.equal(radioFinal.chapterFour.decision,'sever');
 assert.equal(radioFinal.campaign.completed.includes('dead-frequency'),true);
 assert.equal(radioFinal.chapterFour.operatorHealth,0);
 await page.locator('#load').click();
 const restoredFinal=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')));
 assert.equal(restoredFinal.chapterFour.stage,'complete');
 assert.equal(restoredFinal.chapterFour.decision,'sever');
 assert.equal(errors.length,0,'Errores JS durante combate final: '+errors.join('; '));
 // Reset to the saved checkpoint required by the existing bunker-puzzle
 // assertions, which remain separately covered above.
 await page.evaluate(()=>{
  const key='dead-road-404-f19-v2',s=JSON.parse(localStorage.getItem(key));
  s.chapterFour={...s.chapterFour,stage:'breaker',breakersMask:0,operatorHealth:150,decision:null};
  s.campaign.completed=['last-stop','missing','nameless'];
  s.campaign.current='dead-frequency';
  localStorage.setItem(key,JSON.stringify(s));
 });
 await page.locator('#load').click();
 await page.keyboard.press('m');
 await page.locator('#load').click();
 const radioSave=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')));
 assert.equal(radioSave.chapterFour.stage,'breaker');
 assert.equal(radioSave.chapterFour.attempts,1);
 assert.equal(radioSave.chapterFour.subcodeAttempts,1);
 assert.equal(radioSave.campaign.current,'dead-frequency');
 assert.equal(errors.length,0,'Errores JS durante el juego: '+errors.join('; '));
 // F26 production smoke: navigate KM96 with real controls after a valid F25 checkpoint.
 await page.evaluate(()=>{
  const key='dead-road-404-f19-v2',s=JSON.parse(localStorage.getItem(key));
  s.km=96;s.ending=null;s.health=100;s.fuel=65;
  s.chapterFour={...s.chapterFour,stage:'complete',operatorHealth:0,breakersMask:3,decision:'sever'};
  s.chapterFive={stage:'locked',beaconsMask:0,dialAttempts:0,hunterHealth:120,cacheTaken:false,decision:null,legacyFinaleAllowed:false};
  s.campaign.completed=['last-stop','missing','nameless','dead-frequency'];
  s.campaign.current='dead-frequency';
  localStorage.setItem(key,JSON.stringify(s));
 });
 await page.locator('#load').click();
 assert.equal(await page.locator('#mile').isEnabled(),true,'El KM96 no se desbloquea tras IV');
 await page.locator('#mile').click();
 await page.locator('#status').filter({hasText:'KM 96'}).waitFor({timeout:12000});
 await page.screenshot({path:'artifacts/km96-f26.png'});
 await page.keyboard.down('w');
 try{await page.locator('#prompt').filter({hasText:'LEER POSTE KILOMÉTRICO'}).waitFor({timeout:30000});}
 finally{await page.keyboard.up('w');}
 await page.keyboard.press('e');
 await page.locator('#objective').filter({hasText:'registrador'}).waitFor();
 await page.keyboard.down('w');
 try{await page.locator('#prompt').filter({hasText:'INSPECCIONAR REGISTRADOR'}).waitFor({timeout:30000});}
 finally{await page.keyboard.up('w');}
 await page.keyboard.press('e');
 await page.locator('#objective').filter({hasText:'DOS balizas'}).waitFor();
 await walkTo(-6,-31,1.3);
 await page.locator('#prompt').filter({hasText:'BALIZA A'}).waitFor({timeout:12000});
 await page.keyboard.press('e');
 const a=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')).chapterFive);
 assert.equal(a.beaconsMask,1,'No se activó la baliza A');
 await walkTo(6,-31,1.3);
 await page.locator('#prompt').filter({hasText:'BALIZA B'}).waitFor({timeout:12000});
 await page.keyboard.press('e');
 await page.locator('#objective').filter({hasText:'combinación'}).waitFor();
 const beacons=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')).chapterFive);
 assert.equal(beacons.beaconsMask,3,'No se activaron ambas balizas');
 await walkTo(0,-42,1.3);
 await page.locator('#prompt').filter({hasText:'DESCIFRAR MARCADOR'}).waitFor({timeout:12000});
 await page.keyboard.press('e');
 await page.locator('#encounter-title').filter({hasText:'MARCADOR DE DISTANCIA'}).waitFor();
 await page.getByRole('button',{name:'0404',exact:true}).click();
 await page.locator('#encounter-text').filter({hasText:'COMBINACIÓN INCORRECTA'}).waitFor();
 await page.getByRole('button',{name:'2496',exact:true}).click();
 await page.locator('#encounter:not(.hidden)').waitFor({state:'hidden'});
 await page.locator('#objective').filter({hasText:'EL AGRIMENSOR'}).waitFor();
 await page.screenshot({path:'artifacts/agrimensor-km96-f26.png'});
 let surveyorDefeated=false;
 for(let attempt=0;attempt<34;attempt++){
  await page.keyboard.press('f');await sleep(560);
  if(await page.locator('#encounter-title').filter({hasText:'EL MAPA QUE NO EXISTE'}).isVisible()){
   surveyorDefeated=true;break;
  }
 }
 const hp=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')).chapterFive.hunterHealth);
 assert.equal(surveyorDefeated,true,'No concluye el combate del Agrimensor; HP='+hp);
 await page.screenshot({path:'artifacts/agrimensor-derrotado-f26.png'});
 await page.getByRole('button',{name:/GUARDAR EL MAPA Y SUS NOMBRES/}).click();
 await page.locator('#encounter-title').filter({hasText:'CAPÍTULO V COMPLETADO'}).waitFor();
 await page.getByRole('button',{name:/REGRESAR AL FIREBIRD/}).click();
 await page.locator('#status').filter({hasText:'CARRETERA'}).waitFor();
 const complete=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')));
 assert.equal(complete.chapterFive.stage,'complete');
 assert.equal(complete.chapterFive.decision,'remember');
 assert.equal(complete.chapterFive.hunterHealth,0);
 assert.equal(complete.campaign.completed.includes('impossible-mile'),true);
 assert.equal(complete.chapterFive.dialAttempts,1);
 await page.locator('#load').click();
 const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')));
 assert.equal(restored.chapterFive.stage,'complete');
 assert.equal(restored.chapterFive.decision,'remember');
 assert.equal(errors.length,0,'Errores JavaScript del KM96: '+errors.join('; '));
 // F27 real-browser narrative closure: valid completion of I–V, physical VI and f27Saved ending.
 await page.evaluate(()=>{
  const key='dead-road-404-f19-v2',s=JSON.parse(localStorage.getItem(key));
  s.km=120;s.health=100;s.fuel=55;s.parts=5;s.ending=null;
  s.mission={stage:'resolved',choice:'rescue'};
  s.chapterOne={...s.chapterOne,stage:'complete',wardenHealth:0};
  s.chapterTwo={...s.chapterTwo,stage:'complete',stalkerHealth:0,ending:'silence'};
  s.chapterThree={...s.chapterThree,stage:'complete',guardianHealth:0,decision:'seal'};
  s.chapterFour={...s.chapterFour,stage:'complete',operatorHealth:0,decision:'sever'};
  s.chapterFive={...s.chapterFive,stage:'complete',hunterHealth:0,decision:'remember'};
  s.chapterSix={stage:'locked',relaysMask:0,codeAttempts:0,doubleHealth:140,suppliesTaken:false,legacyFinaleAllowed:false};
  s.campaign.completed=['last-stop','missing','nameless','dead-frequency','impossible-mile'];
  s.campaign.current='impossible-mile';
  localStorage.setItem(key,JSON.stringify(s));
 });
 await page.locator('#load').click();
 assert.equal(await page.locator('#road-end').isEnabled(),true,'El sexto capítulo no se desbloquea después de V y KM120');
 await page.locator('#road-end').click();
 await page.locator('#status').filter({hasText:'KM 120'}).waitFor({timeout:12000});
 await page.screenshot({path:'artifacts/f27-ultimo-peaje.png'});
 await page.keyboard.down('w');
 try{await page.locator('#prompt').filter({hasText:'ÚLTIMA SEÑAL'}).waitFor({timeout:28000});}
 finally{await page.keyboard.up('w');}
 await page.keyboard.press('e');
 await page.locator('#objective').filter({hasText:'registro de peajes'}).waitFor();
 await page.keyboard.down('w');
 try{await page.locator('#prompt').filter({hasText:'REGISTRO DE PEAJES'}).waitFor({timeout:28000});}
 finally{await page.keyboard.up('w');}
 await page.keyboard.press('e');
 await page.locator('#objective').filter({hasText:'DOS relés'}).waitFor();
 await walkTo(-6,-30,1.3);
 await page.locator('#prompt').filter({hasText:'RELÉ A'}).waitFor({timeout:12000});
 await page.keyboard.press('e');
 const f27First=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')).chapterSix);
 assert.equal(f27First.relaysMask,1,'La interacción real no activa el primer relé');
 await walkTo(6,-30,1.3);
 await page.locator('#prompt').filter({hasText:'RELÉ B'}).waitFor({timeout:12000});
 await page.keyboard.press('e');
 await page.locator('#objective').filter({hasText:'barrera'}).waitFor();
 const f27Both=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')).chapterSix);
 assert.equal(f27Both.relaysMask,3,'Ambos relés deben estar activos');
 await walkTo(0,-42,1.3);
 await page.locator('#prompt').filter({hasText:'ABRIR BARRERA'}).waitFor({timeout:12000});
 await page.keyboard.press('e');
 await page.locator('#encounter-title').filter({hasText:'ÚLTIMA BARRERA'}).waitFor();
 await page.getByRole('button',{name:'0217',exact:true}).click();
 await page.locator('#encounter-text').filter({hasText:'CÓDIGO INCORRECTO'}).waitFor();
 await page.getByRole('button',{name:'1204',exact:true}).click();
 await page.locator('#encounter:not(.hidden)').waitFor({state:'hidden'});
 await page.locator('#objective').filter({hasText:'EL DOBLE'}).waitFor();
 await page.screenshot({path:'artifacts/f27-el-doble.png'});
 await page.keyboard.down('w');await sleep(1750);await page.keyboard.up('w');
 let f27Vanquished=false;
 for(let n=0;n<28;n++){
  await page.keyboard.press('f');await sleep(560);
  if(await page.locator('#encounter-title').filter({hasText:'ÚLTIMO DESVÍO'}).isVisible()){
   f27Vanquished=true;break;
  }
 }
 const f27Hp=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')).chapterSix.doubleHealth);
 assert.equal(f27Vanquished,true,'El combate físico no permite derrotar al Doble; HP='+f27Hp+'; '+await page.locator('#prompt').innerText());
 await page.screenshot({path:'artifacts/f27-doble-derrotado.png'});
 await page.getByRole('button',{name:/ABANDONAR LA CARRETERA/}).click();
 await page.locator('#encounter-title').filter({hasText:'AMANECER PRESTADO'}).waitFor();
 await page.getByRole('button',{name:/GUARDAR FINAL Y REGRESAR/}).click();
 await page.locator('#status').filter({hasText:'CARRETERA'}).waitFor();
 const f27Done=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')));
 assert.equal(f27Done.chapterSix.stage,'complete');
 assert.equal(f27Done.chapterSix.relaysMask,3);
 assert.equal(f27Done.chapterSix.codeAttempts,1);
 assert.equal(f27Done.chapterSix.doubleHealth,0);
 assert.equal(f27Done.ending,'dawn');
 assert.equal(f27Done.campaign.completed.includes('road-end'),true);
 await page.locator('#load').click();
 const f27Saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('dead-road-404-f19-v2')));
 assert.equal(f27Saved.ending,'dawn');
 assert.equal(f27Saved.chapterSix.stage,'complete');
 assert.equal(await page.locator('#road-end').isEnabled(),false,'Final registrado debe bloquear el capítulo');
 assert.equal(errors.length,0,'Errores JS en final F27: '+errors.join('; '));
 console.log('PASS Chromium F27: KM120, peaje PSX, ambos relés, panel 1204, Doble, Amanecer Prestado y recuperación.');
 console.log('PASS Chromium F26: KM96 real, registrador, balizas, código, Agrimensor, decisión y guardado.');
 console.log('PASS Chromium F25: emisora WXR-404, bunker UMBRAL, dos codigos y persistencia, portada pulp, opciones, capítulos, pausa real, PSX, inventario, conduccion '+velocity+' km/h, capítulo I, THE LAST LIGHT 3D, cerradura 4040→1992, guardado del capítulo II, pueblo sin nombre 3D, reloj 0404→0313 y persistencia del capítulo III.');
}catch(error){console.error(error);console.error('Vite:',logs.slice(-3000));process.exitCode=1;}
finally{await browser?.close();try{if(process.platform==='win32')server.kill('SIGTERM');else process.kill(-server.pid,'SIGTERM');}catch{}server.stdout?.destroy();server.stderr?.destroy();}
