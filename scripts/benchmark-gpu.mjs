/**
 * F30 local foreground browser benchmark. Measurements are diagnostic rAF
 * intervals, not GPU timestamps. No telemetry uploads, no destructive writes.
 *
 * npm run benchmark:gpu -- --repeats=3 --seconds=10
 * npm run benchmark:gpu -- --headless --swiftshader --repeats=1
 */
import assert from 'node:assert/strict';
import os from 'node:os';
import {spawn,spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {chromium} from 'playwright';
import {frameSummary,frameSummaryText} from './benchmark-metrics.mjs';

const args=process.argv.slice(2);
const flag=n=>args.includes(n);
const value=(name,fallback,min,max)=>{
 const token=args.find(s=>s.startsWith(name+'='));
 if(!token)return fallback;
 const n=Number(token.slice(name.length+1));
 if(!Number.isFinite(n)||n<min||n>max)throw new Error('Opción inválida: '+token);
 return n;
};
const seconds=value('--seconds',8,2,1200);
const repeats=Math.trunc(value('--repeats',2,1,5));
const headless=flag('--headless'),software=flag('--swiftshader'),requireHardware=flag('--require-hardware');
const minFps=value('--min-fps',0,0,240);
const width=1280,height=800,base='http://127.0.0.1:4174/DEAD-ROAD-404/';
const argsBrowser=['--enable-webgl'];
if(software)argsBrowser.push('--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader');
const server=spawn(process.platform==='win32'?'npm.cmd':'npm',
 ['run','preview','--','--host','127.0.0.1','--port','4174','--strictPort'],
 {stdio:'pipe',detached:process.platform!=='win32',shell:process.platform==='win32',
 env:{...process.env,GITHUB_REPOSITORY:'ivan7800/DEAD-ROAD-404'}});
let output='';for(const stream of [server.stdout,server.stderr])stream.on('data',v=>{output+=String(v);});
let browser;
async function waitForPreview(){
 for(let n=0;n<70;n++){
  if(server.exitCode!==null)throw Error('Preview finalizado: '+output);
  try{const res=await fetch(base);if(res.ok)return;}catch{}
  await sleep(200);
 }
 throw Error('Preview no disponible: '+output);
}
async function measure(page,mode,label,run){
 // A warmup avoids treating shader setup and boot animation as steady-state.
 await sleep(1400);
 const deltas=await page.evaluate(async duration=>{
  const samples=[];
  await new Promise(resolve=>{
   let start=null,previous=null;
   function tick(timestamp){
    if(start===null)start=timestamp;
    if(previous!==null)samples.push(timestamp-previous);
    previous=timestamp;
    if(timestamp-start<duration)requestAnimationFrame(tick);
    else resolve();
   }
   requestAnimationFrame(tick);
  });
  return samples;
 },seconds*1000);
 const report=frameSummary(deltas);
 const hud=await page.locator('#perf-panel').innerText();
 const drawCalls=Number(hud.match(/(\d+) draw calls/)?.[1]??NaN);
 const triangles=Number(hud.match(/(\d+) triángulos/)?.[1]??NaN);
 const dpr=Number(hud.match(/DPR ([0-9.]+)/)?.[1]??NaN);
 const status=await page.locator('#status').innerText();
 if(mode==='drive')assert.ok(status.includes('FIREBIRD'),'El vehículo ha salido de conducción durante la prueba');
 if(mode==='explore')assert.ok(status.includes('EXPLORACIÓN'),'La escena de exploración ha cambiado');
 console.log(`[F30] ${label} #${run}: ${frameSummaryText(report)} · draw calls ${drawCalls}`);
 return {scene:label,repeat:run,mode,status,...report,drawCalls,triangles,dpr};
}
try{
 await waitForPreview();
 browser=await chromium.launch({headless,args:argsBrowser});
 const page=await browser.newPage({viewport:{width,height}});
 const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
 const res=await page.goto(base,{waitUntil:'domcontentloaded'});
 assert.equal(res?.status(),200,'La compilación no responde');
 await page.locator('#art-status').filter({hasText:'ARTE PSX'}).waitFor({timeout:20000});
 await page.keyboard.press('F3');
 await page.locator('#perf-panel').filter({hasText:'draw calls'}).waitFor({timeout:10000});
 const gpu=await page.evaluate(()=>{
  const gl=document.querySelector('#scene')?.getContext('webgl2');
  if(!gl)return {webgl:'unavailable',vendor:'unknown',renderer:'unknown',unmasked:false};
  const info=gl.getExtension('WEBGL_debug_renderer_info');
  return {webgl:'webgl2',unmasked:!!info,
   vendor:String(info?gl.getParameter(info.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR)),
   renderer:String(info?gl.getParameter(info.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER))};
 });
 const softwareRenderer=/swiftshader|llvmpipe|softpipe|software rasterizer|mesa offscreen|microsoft basic render/i.test(gpu.renderer);
 const identifiableGpu=gpu.unmasked&&gpu.renderer!=='unknown'&&!/^webgl\s/i.test(gpu.renderer);
 if(requireHardware&&(headless||software||softwareRenderer||!identifiableGpu||gpu.webgl==='unavailable'))
  throw Error('GPU física NO verificada: '+gpu.renderer+'. Revisa los drivers o quita --require-hardware.');
 console.log('[F30] '+gpu.renderer+(softwareRenderer?' (renderizador software)':' (aceleración no certificada)'));
 const rows=[];
 await page.locator('#drive').click();
 await page.locator('#dashboard.visible').waitFor();
 for(let i=1;i<=repeats;i++)rows.push(await measure(page,'drive','Conducción quieta',i));
 await page.keyboard.press('m');
 await page.locator('#panel:not(.hidden)').waitFor();
 await page.locator('#explore').click();
 await page.locator('#status').filter({hasText:'EXPLORACIÓN'}).waitFor();
 for(let i=1;i<=repeats;i++)rows.push(await measure(page,'explore','Exploración quieta',i));
 const failed=minFps>0?rows.filter(x=>x.meanFps<minFps||x.low1Fps<minFps):[];
 assert.equal(pageErrors.length,0,'Excepciones JS: '+pageErrors.join('; '));
 const timestamp=new Date().toISOString(),folder=resolve('artifacts','benchmarks');
 mkdirSync(folder,{recursive:true});
 const stamp=timestamp.replace(/[:.]/g,'-');
 const file=resolve(folder,'f36-'+stamp+'.json');
 const report={
  phase:36,version:'0.21.8',timestamp,url:base,viewport:{width,height},
  options:{repeats,seconds,headless,requestedSwiftShader:software,requireHardware,minFps},
  environment:{platform:process.platform,arch:process.arch,osRelease:os.release(),
   node:process.version,browser:browser.version(),cpuLogical:os.cpus().length,
   ...gpu,softwareRenderer,identifiableGpu},
  caveat:'Medidas de rAF, no tiempos de GPU. La identidad del renderizador no prueba por sí sola aceleración sostenida ni validez del equipo físico.',
  results:rows,errors:pageErrors,thresholdPassed:failed.length===0,thresholdFailures:failed.map(x=>({scene:x.scene,repeat:x.repeat,meanFps:x.meanFps,low1Fps:x.low1Fps}))
 };
 writeFileSync(file,JSON.stringify(report,null,2)+'\n');
 const md=resolve(folder,'f36-'+stamp+'.md');
 writeFileSync(md,
  '# DEAD ROAD 404 — Benchmark F36\n\n'+
  `Fecha: ${timestamp}. GPU declarada: ${gpu.renderer}. Perfil: ${headless?'headless':'con ventana'}.\n\n`+
  '| Escenario | Repetición | FPS medios | 1% bajo | p95 ms | Draw calls | Triángulos |\n'+
  '|---|---:|---:|---:|---:|---:|---:|\n'+
  rows.map(x=>`| ${x.scene} | ${x.repeat} | ${x.meanFps} | ${x.low1Fps} | ${x.p95FrameMs} | ${x.drawCalls} | ${x.triangles} |`).join('\n')+
  '\n\nLa frecuencia de requestAnimationFrame aproxima la cadencia, no mide tiempo de GPU.\n');
 console.log('[F36] Resultado JSON: '+file);
 console.log('[F36] Informe Markdown: '+md);
 if(failed.length)throw Error('F36 umbral '+minFps+' FPS incumplido; evidencia conservada en '+file);
}catch(err){
 console.error('[F30] ERROR:',err instanceof Error?err.message:String(err));
 process.exitCode=1;
}finally{
 await browser?.close();
 if(server.pid){
  if(process.platform==='win32')spawnSync('taskkill',['/PID',String(server.pid),'/T','/F'],{stdio:'ignore'});
  else{try{process.kill(-server.pid,'SIGTERM');}catch{server.kill('SIGTERM');}}
 }
}
