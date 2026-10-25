/**
 * DEAD ROAD 404 F32 — responsive/keyboard checks and bounded foreground soak.
 * Playwright operates in an isolated browser profile; no user files are modified.
 * npm run qa:stability
 * npm run qa:stability -- --minutes=10       # longer local soak
 * npm run qa:stability -- --seconds=20        # CI bounded smoke
 */
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const arg=n=>process.argv.slice(2).find(a=>a.startsWith(n+'='));
const numeric=(n,fallback,lo,hi)=>{
 const a=arg(n),v=a?Number(a.slice(n.length+1)):fallback;
 if(!Number.isFinite(v)||v<lo||v>hi)throw Error('Valor inválido '+n+': '+v);
 return v;
};
const seconds=numeric('--seconds',numeric('--minutes',10,0.1,60)*60,8,3600);
const base='http://127.0.0.1:4177/DEAD-ROAD-404/';
const headless=!process.argv.includes('--headed');
const server=spawn(process.platform==='win32'?'npm.cmd':'npm',
 ['run','preview','--','--host','127.0.0.1','--port','4177','--strictPort'],
 {stdio:'pipe',detached:process.platform!=='win32',shell:process.platform==='win32',
  env:{...process.env,GITHUB_REPOSITORY:'ivan7800/DEAD-ROAD-404'}});
let logs='';for(const stream of [server.stdout,server.stderr])
 stream.on('data',buffer=>logs+=String(buffer));
let browser;
const artifacts=resolve('artifacts');
const report={phase:32,started:new Date().toISOString(),durationSeconds:seconds,headless,
 pages:[],cycles:0,reloads:0,errors:[],failedRequests:[],memory:[],note:
 'Duración acotada en CI; no equivale a una partida completa ni a validación visual humana.'};
async function ready(){
 for(let n=0;n<75;n++){
  if(server.exitCode!==null)throw Error('Vite cerrado: '+logs);
  try{const r=await fetch(base);if(r.ok)return;}catch{}
  await sleep(180);
 }
 throw Error('Vista previa no disponible: '+logs);
}
function attach(page){
 page.on('pageerror',e=>report.errors.push(e.message));
 page.on('requestfailed',request=>{
  if(!request.failure()?.errorText?.includes('ERR_ABORTED'))
   report.failedRequests.push(request.url()+' · '+request.failure()?.errorText);
 });
}
async function boot(page){
 const res=await page.goto(base,{waitUntil:'domcontentloaded'});
 assert.equal(res?.status(),200);
 await page.locator('#art-status').filter({hasText:'ARTE PSX'}).waitFor({timeout:25000});
}
async function checkBounds(page,id){
 const d=await page.evaluate(()=>{
  const j=document.querySelector('#journal'),r=j.getBoundingClientRect();
  return {viewport:{width:innerWidth,height:innerHeight},x:r.x,y:r.y,
   right:r.right,bottom:r.bottom,scrollHeight:j.scrollHeight,clientHeight:j.clientHeight,
   documentWidth:document.documentElement.scrollWidth};
 });
 assert.ok(d.y>=0&&d.bottom<=d.viewport.height+2,'Diario recortado en '+id+': '+JSON.stringify(d));
 assert.ok(d.x>=0&&d.right<=d.viewport.width+2,'Diario horizontal fuera de pantalla '+id);
 assert.ok(d.documentWidth<=d.viewport.width+3,'Documento desborda '+id);
 assert.ok(d.clientHeight>0,'Diario sin altura '+id);
 return d;
}
try{
 await ready();mkdirSync(artifacts,{recursive:true});
 browser=await chromium.launch({headless,args:[
  '--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'
 ]});
 const viewports=[
  {id:'movil-320',width:320,height:568},
  {id:'movil-horizontal',width:568,height:320},
  {id:'escritorio',width:1280,height:800}
 ];
 for(const v of viewports){
  const page=await browser.newPage({viewport:{width:v.width,height:v.height}});
  attach(page);await boot(page);
  await page.keyboard.press('j');
  await page.locator('#journal:not(.hidden)').waitFor();
  const focus=await page.evaluate(()=>document.activeElement?.id);
  assert.equal(focus,'journal','El diario no captura el foco '+v.id);
  const rect=await checkBounds(page,v.id);
  assert.equal(await page.locator('#journal-close').isVisible(),true);
  await page.locator('#journal-close').scrollIntoViewIfNeeded();
  await page.screenshot({path:resolve(artifacts,'f32-'+v.id+'-diario.png')});
  await page.locator('#journal-close').click();
  await page.locator('#journal:not(.hidden)').waitFor({state:'hidden'});
  await page.locator('#new').click();
  await page.locator('#encounter:not(.hidden)').waitFor();
  const card=await page.locator('.encounter-card').evaluate(el=>{
   const r=el.getBoundingClientRect();
   return {top:r.top,bottom:r.bottom,vh:innerHeight,sh:el.scrollHeight,ch:el.clientHeight};
  });
  assert.ok(card.top>=-1&&card.bottom<=card.vh+2,
   'Diálogo de nueva partida fuera de viewport '+v.id+': '+JSON.stringify(card));
  await page.getByRole('button',{name:'CONFIRMAR NUEVA PARTIDA'}).scrollIntoViewIfNeeded();
  await page.screenshot({path:resolve(artifacts,'f32-'+v.id+'-confirmacion.png')});
  await page.getByRole('button',{name:/CANCELAR · CONSERVAR PARTIDA/}).click();
  report.pages.push({id:v.id,journal:rect,encounter:card});
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 attach(page);await boot(page);
 const deadline=Date.now()+seconds*1000;
 let beforeReload=null;
 while(Date.now()<deadline){
  // Repeat gameplay/menu transitions using real keyboard and UI controls.
  const driving=report.cycles%2===0;
  await page.locator(driving?'#drive':'#explore').click();
  await page.locator('#panel:not(.hidden)').waitFor({state:'hidden'});
  await page.keyboard.down('w');await sleep(240);await page.keyboard.up('w');
  if(!driving){
   await page.keyboard.press('j');
   await page.locator('#journal:not(.hidden)').waitFor();
   await page.keyboard.press('j');
   await page.locator('#journal:not(.hidden)').waitFor({state:'hidden'});
  }
  await page.keyboard.press('m');
  await page.locator('#panel:not(.hidden)').waitFor();
  await page.locator('#save').click();
  report.cycles++;
  if(report.cycles%5===0){
   beforeReload=JSON.parse(await page.evaluate(()=>localStorage.getItem('dead-road-404-f19-v2')));
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('#art-status').filter({hasText:'ARTE PSX'}).waitFor({timeout:25000});
   await page.locator('#load').click();
   const after=JSON.parse(await page.evaluate(()=>localStorage.getItem('dead-road-404-f19-v2')));
   assert.equal(after.km,beforeReload.km,'Odómetro alterado tras recarga');
   assert.equal(after.parts,beforeReload.parts,'Piezas alteradas tras recarga');
   report.reloads++;
  }
  if(report.cycles%5===0){
   report.memory.push(await page.evaluate(()=>{
    const m=performance.memory;
    return {heapUsed:m?.usedJSHeapSize??null,heapLimit:m?.jsHeapSizeLimit??null};
   }));
  }
 }
 assert.ok(report.cycles>=2,'No se completaron dos ciclos de conducción/exploración');
 assert.deepEqual(report.errors,[],'Excepciones en prueba de estabilidad');
 assert.deepEqual(report.failedRequests,[],'Recursos fallidos en prueba de estabilidad');
 report.completed=new Date().toISOString();report.passed=true;
 writeFileSync(resolve(artifacts,'f32-stability.json'),JSON.stringify(report,null,2)+'\n');
 console.log('PASS F32: '+report.pages.length+' viewports, '+report.cycles+
  ' ciclos de conducción/exploración, '+report.reloads+' recargas; 0 errores JS.');
}catch(e){
 report.completed=new Date().toISOString();report.passed=false;
 report.failure=e instanceof Error?e.stack:String(e);
 writeFileSync(resolve(artifacts,'f32-stability.json'),JSON.stringify(report,null,2)+'\n');
 console.error('FAIL F32',e);
 console.error('Preview: '+logs.slice(-1400));
 process.exitCode=1;
}finally{
 await browser?.close();
 if(server.pid){
  if(process.platform==='win32')spawnSync('taskkill',['/PID',String(server.pid),'/T','/F'],{stdio:'ignore'});
  else{try{process.kill(-server.pid,'SIGTERM');}catch{server.kill('SIGTERM');}}
 }
}
