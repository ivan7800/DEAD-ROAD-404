/** F31: test all four final paths in actual Chromium UI, plus responsive layouts.
 * Existing full gameplay smoke remains the source of evidence for physical boss combat.
 * Checkpoints here use the game's real save schema, UI buttons and save/load handler.
 */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {chromium} from 'playwright';

const base='http://127.0.0.1:4175/DEAD-ROAD-404/';
const subprocess=spawn(process.platform==='win32'?'npm.cmd':'npm',
 ['run','preview','--','--host','127.0.0.1','--port','4175','--strictPort'],
 {shell:process.platform==='win32',stdio:'pipe',detached:process.platform!=='win32',
 env:{...process.env,GITHUB_REPOSITORY:'ivan7800/DEAD-ROAD-404'}});
let logs='';for(const stream of [subprocess.stdout,subprocess.stderr])
 stream.on('data',chunk=>logs+=String(chunk));
let browser;
const key='dead-road-404-f19-v2';
const cases=[
 {id:'dawn',title:'AMANECER PRESTADO',choice:'ABANDONAR LA CARRETERA',mission:'rescue',town:'seal',radio:'sever',mile:'remember'},
 {id:'toll',title:'EL PEAJE',choice:'ABANDONAR LA CARRETERA',mission:'leave',town:'seal',radio:'sever',mile:'forget'},
 {id:'loop',title:'KILÓMETRO 404',choice:'ESCUCHAR LA RADIO',mission:'rescue',town:'seal',radio:'sever',mile:'remember'},
 {id:'chorus',title:'EL CORO DE LOS AUSENTES',choice:'ESCUCHAR LA RADIO',mission:'rescue',town:'transmit',radio:'broadcast',mile:'remember'}
];
async function ready(){
 for(let attempt=0;attempt<75;attempt++){
  if(subprocess.exitCode!==null)throw Error('Vite cerró: '+logs);
  try{const res=await fetch(base);if(res.ok)return;}catch{}
  await sleep(220);
 }
 throw Error('No se inicia vista previa: '+logs);
}
async function visualCheck(page,id){
 const metrics=await page.evaluate(()=>{
  const root=document.documentElement;
  const menu=document.querySelector('#panel');
  const rect=menu?.getBoundingClientRect();
  return {vw:innerWidth,vh:innerHeight,documentWidth:root.scrollWidth,
   panelVisible:Boolean(rect?.width&&rect?.height),
   panelWidth:rect?.width,panelLeft:rect?.left,panelRight:rect?.right,
   canvasWidth:document.querySelector('#scene')?.width,
   canvasHeight:document.querySelector('#scene')?.height};
 });
 assert.ok(metrics.canvasWidth>0&&metrics.canvasHeight>0,'Canvas sin resolución '+id);
 assert.ok(metrics.documentWidth<=metrics.vw+3,
  'Desbordamiento horizontal '+id+': '+JSON.stringify(metrics));
 // A screenshot is a reproducible visual artifact, not evidence of subjective design quality.
 await page.screenshot({path:resolve('artifacts','f31-'+id+'.png'),fullPage:true});
 return metrics;
}
try{
 await ready();mkdirSync('artifacts',{recursive:true});
 browser=await chromium.launch({headless:true,args:[
  '--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'
 ]});
 const results=[];
 for(const ending of cases){
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.locator('#art-status').filter({hasText:'ARTE PSX'}).waitFor({timeout:25000});
  await page.locator('#save').click();
  await page.evaluate(({key,ending})=>{
   const s=JSON.parse(localStorage.getItem(key));
   s.km=120;s.health=100;s.ending=null;s.fuel=30;s.parts=4;
   s.mission={stage:'resolved',choice:ending.mission};
   for(const chapter of ['chapterOne','chapterTwo','chapterThree','chapterFour','chapterFive'])
    s[chapter]={...s[chapter],stage:'complete'};
   s.chapterThree.decision=ending.town;
   s.chapterFour.decision=ending.radio;
   s.chapterFive.decision=ending.mile;
   s.chapterSix={stage:'choice',relaysMask:3,codeAttempts:0,doubleHealth:0,
    suppliesTaken:false,legacyFinaleAllowed:false};
   s.campaign.completed=['last-stop','missing','nameless','dead-frequency','impossible-mile'];
   s.campaign.current='road-end';
   localStorage.setItem(key,JSON.stringify(s));
  },{key,ending});
  await page.locator('#load').click();
  await page.locator('#encounter-title').filter({hasText:'ÚLTIMO DESVÍO'}).waitFor({timeout:15000});
  await page.getByRole('button',{name:new RegExp(ending.choice)}).click();
  await page.locator('#encounter-title').filter({hasText:ending.title}).waitFor();
  const state=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.equal(state.ending,ending.id,'Final no guardado desde UI: '+ending.id);
  assert.equal(state.chapterSix.stage,'complete');
  assert.equal(state.campaign.completed.includes('road-end'),true);
  await page.screenshot({path:resolve('artifacts','f31-final-'+ending.id+'.png')});
  await page.getByRole('button',{name:/GUARDAR FINAL Y REGRESAR AL MENÚ/}).click();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#art-status').filter({hasText:'ARTE PSX'}).waitFor({timeout:25000});
  await page.locator('#load').click();
  const restored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
  assert.equal(restored.ending,ending.id,'Final alterado tras recarga: '+ending.id);
  assert.equal(await page.locator('#road-end').isEnabled(),false,'Final desbloquea capítulo cerrado');
  assert.deepEqual(errors,[],'Excepciones JS '+ending.id);
  results.push({ending:ending.id,title:ending.title,persisted:true,errors:0});
  console.log('PASS F31 FINAL '+ending.id.toUpperCase()+' · '+ending.title+' · save/load Chromium');
  await page.close();
 }
 // Responsive verification on separate, clean contexts; no changes to user data.
 const viewports=[{id:'desktop-1280',width:1280,height:800},
  {id:'mobile-390',width:390,height:844}];
 const layouts=[];
 for(const viewport of viewports){
  const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},
   isMobile:viewport.width<500,hasTouch:viewport.width<500});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.locator('#art-status').filter({hasText:'ARTE PSX'}).waitFor({timeout:25000});
  const metrics=await visualCheck(page,viewport.id+'-menu');
  await page.locator('#pulp-options-open').click();
  await page.locator('#pulp-options:not(.hidden)').waitFor();
  await page.screenshot({path:resolve('artifacts','f31-'+viewport.id+'-options.png'),fullPage:true});
  await page.locator('#pulp-options-close').click();
  assert.deepEqual(errors,[],'Errores responsivos '+viewport.id);
  layouts.push({id:viewport.id,...metrics,errors:0});
  await page.close();
 }
 const output={phase:31,run:new Date().toISOString(),headless:true,softwareRenderer:true,
  disclaimer:'Capturas automáticas; no equivalen a validación estética humana ni GPU real.',
  endings:results,layouts};
 writeFileSync(resolve('artifacts','f31-validation.json'),JSON.stringify(output,null,2)+'\n');
 console.log('PASS F31: cuatro finales UI + guardado/recarga + capturas responsive');
}catch(e){
 console.error('FAIL F31:',e);
 console.error('Vite: '+logs.slice(-2200));
 process.exitCode=1;
}finally{
 await browser?.close();
 try{if(process.platform==='win32')subprocess.kill('SIGTERM');
 else process.kill(-subprocess.pid,'SIGTERM');}catch{}
 subprocess.stdout?.destroy();subprocess.stderr?.destroy();
}
