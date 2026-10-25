/**
 * F33 · Six-chapter PSX screenshot tour / automated viewport geometry.
 * Run: npm run qa:visual
 * Generates 12 reproducible screenshots and JSON evidence using isolated saves.
 * Static images and bounds are diagnostics, NOT a human visual quality sign-off.
 */
import assert from 'node:assert/strict';
import {spawn,spawnSync} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const base='http://127.0.0.1:4178/DEAD-ROAD-404/';
const saveKey='dead-road-404-f19-v2';
const chapters=[
 {id:'last-stop',control:'explore',title:'LA ÚLTIMA PARADA',status:'EXPLORACIÓN'},
 {id:'missing',control:'diner',title:'LOS QUE NO REGRESAN',status:'THE LAST LIGHT'},
 {id:'nameless',control:'town',title:'EL PUEBLO SIN NOMBRE',status:'PUEBLO SIN NOMBRE'},
 {id:'dead-frequency',control:'radio',title:'FRECUENCIA MUERTA',status:'WXR-404'},
 {id:'impossible-mile',control:'mile',title:'EL KILÓMETRO IMPOSIBLE',status:'KM 96'},
 {id:'road-end',control:'road-end',title:'DONDE TERMINA LA CARRETERA',status:'KM 120'}
];
const sizes=[{name:'escritorio',width:1280,height:800},
 {name:'movil',width:390,height:844},
 {name:'movil-compacto',width:320,height:568}];
const server=spawn(process.platform==='win32'?'npm.cmd':'npm',
 ['run','preview','--','--host','127.0.0.1','--port','4178','--strictPort'],
 {stdio:'pipe',shell:process.platform==='win32',detached:process.platform!=='win32',
 env:{...process.env,GITHUB_REPOSITORY:'ivan7800/DEAD-ROAD-404'}});
let output='';for(const stream of [server.stdout,server.stderr])
 stream.on('data',x=>output+=String(x));
let browser;
const report={phase:33,date:new Date().toISOString(),renderer:'Chromium SwiftShader headless',
 cases:[],errors:[],notes:[
 'Capturas de capítulos obtenidas con checkpoints de campaña y botones reales.',
 'No son seis campañas completas ni una valoración visual humana o prueba GPU física.'
]};
async function serverReady(){
 for(let n=0;n<90;n++){
  if(server.exitCode!==null)throw Error('Servidor cerrado: '+output);
  try{if((await fetch(base)).ok)return;}catch{}
  await sleep(180);
 }
 throw Error('Timeout de servidor '+output);
}
async function screenshotScene(chapter,index,size){
 const page=await browser.newPage({viewport:{width:size.width,height:size.height},
  reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',err=>errors.push(err.message));
 page.on('console',msg=>{if(msg.type()==='error')errors.push('console: '+msg.text());});
 try{
  const response=await page.goto(base,{waitUntil:'domcontentloaded'});
  assert.equal(response?.status(),200);
  await page.locator('#art-status').filter({hasText:'ARTE PSX'}).waitFor({timeout:22000});
  if(index===0){
   await page.locator('#pulp-options-open').click();
   await page.locator('#pulp-options:not(.hidden)').waitFor();
   await page.locator('#pulp-high-contrast').check();
   await page.locator('#pulp-large-text').check();
   await page.locator('#pulp-reduce-motion').check();
   assert.equal(await page.locator('html.pulp-high-contrast.pulp-large-text.pulp-reduce-motion').count(),1,
    'Preferencias de accesibilidad no aplicadas');
   const prefShot='f33-accesibilidad-'+size.name+'.png';
   await page.screenshot({path:resolve('artifacts',prefShot)});
   await page.locator('#pulp-options-close').click();
  }
  await page.locator('#save').click();
  await page.evaluate(({key,index,chapters})=>{
   const s=JSON.parse(localStorage.getItem(key));
   s.km=index*24;s.ending=null;s.health=100;s.fuel=65;s.parts=5;
   s.encounterResolved=true;
   s.mission={stage:'resolved',choice:'rescue'};
   const chapterFields=['chapterOne','chapterTwo','chapterThree','chapterFour','chapterFive'];
   for(let n=0;n<index;n++){
    const field=chapterFields[n];
    if(!field)break;
    s[field]={...s[field],stage:'complete'};
   }
   s.chapterOne.decision='preserve';s.chapterOne.wardenHealth=0;
   s.chapterTwo.ending='silence';s.chapterTwo.stalkerHealth=0;
   s.chapterThree.decision='seal';s.chapterThree.guardianHealth=0;
   s.chapterFour.decision='sever';s.chapterFour.operatorHealth=0;
   s.chapterFive.decision='remember';s.chapterFive.hunterHealth=0;
   s.campaign.completed=chapters.slice(0,index);
   s.campaign.current=chapters[Math.max(0,index-1)];
   localStorage.setItem(key,JSON.stringify(s));
  },{key:saveKey,index,chapters:chapters.map(c=>c.id)});
  await page.locator('#load').click();
  assert.equal(await page.locator('#'+chapter.control).isEnabled(),true,
   'La cinta '+chapter.title+' no está disponible con su checkpoint válido.');
  await page.locator('#'+chapter.control).click();
  await page.locator('#panel:not(.hidden)').waitFor({state:'hidden',timeout:14000});
  await page.locator('#status').filter({hasText:chapter.status}).waitFor({timeout:16000});
  // Avoid title-card overlays obscuring screenshots, regardless of RAF speed.
  await page.waitForFunction(()=>!document.getElementById('pulp-transition')?.classList.contains('active'),
   null,{timeout:13000});
  await sleep(350);
  const diag=await page.evaluate(()=>{
   const canvas=document.querySelector('#scene');
   const status=document.getElementById('status');
   const objective=document.getElementById('objective');
   const bounds=el=>{
    const r=el?.getBoundingClientRect();
    return r?{x:r.x,y:r.y,left:r.left,top:r.top,right:r.right,bottom:r.bottom,
     width:r.width,height:r.height}:null;
   };
   const root=document.documentElement;
   return {viewport:{width:innerWidth,height:innerHeight},
    canvas:{width:canvas.width,height:canvas.height,bounds:bounds(canvas)},
    documentWidth:root.scrollWidth,status:bounds(status),objective:bounds(objective),
    brand:bounds(document.querySelector('header .brand')),
    pause:bounds(document.querySelector('#pulp-pause-access')),
    stats:bounds(document.querySelector('#stats')),
    stamina:bounds(document.querySelector('#stamina-wrap')),
    prompt:bounds(document.querySelector('#prompt')),
    toast:bounds(document.querySelector('#toast')),
    toastShown:document.getElementById('toast')?.classList.contains('show'),
    graphicsShown:getComputedStyle(document.querySelector('.graphics-label')).display!=='none',
    artShown:getComputedStyle(document.querySelector('.art-status')).display!=='none',
    inventory:bounds(document.querySelector('#inventory-access')),
    controls:bounds(document.querySelector('#show-controls')),
    objectiveText:objective?.textContent?.slice(0,180),
    statusText:status?.textContent,
    artStatus:document.getElementById('art-status')?.textContent,
    overflowElements:[...document.querySelectorAll('body *')].filter(el=>{
     const st=getComputedStyle(el),r=el.getBoundingClientRect();
     return st.display!=='none'&&st.visibility!=='hidden'&&Number(st.opacity)>0&&
       r.width>0&&r.height>0&&(r.right>innerWidth+3||r.left< -3);
    }).slice(0,20).map(el=>{
     const rect=el.getBoundingClientRect();
     return {tag:el.tagName,id:el.id,className:String(el.className).slice(0,90),
      left:Math.round(rect.left),right:Math.round(rect.right)};
    })};
  });
  assert.ok(diag.canvas.width>0&&diag.canvas.height>0,'Canvas sin tamaño en '+chapter.title);
  assert.ok(diag.status.width>0&&diag.status.height>0,'Estado oculto en '+chapter.title);
  assert.ok(diag.status.right>0&&diag.status.left<size.width,
   'Estado fuera de vista horizontal: '+JSON.stringify(diag));
  assert.ok(diag.status.top>=-2&&diag.status.bottom<=size.height+2,
   'Estado fuera de vista vertical: '+JSON.stringify(diag));
  // ScrollWidth also counts hidden/offscreen tape decoration. The screenshot
  // must reject any ACTUALLY VISIBLE element outside the viewport.
  assert.equal(diag.overflowElements.length,0,
   'Elementos visibles fuera del viewport '+chapter.title+': '+JSON.stringify(diag));
  if(diag.documentWidth>size.width+3)
   console.log('F34 AVISO: scrollWidth virtual '+diag.documentWidth+' > '+size.width+
    ' sin elementos visibles fuera de pantalla · '+chapter.id+' '+size.name);
  assert.ok(diag.objectiveText?.trim().length>0,'Objetivo ausente: '+chapter.title);
  if(size.width<=390){
   const overlaps=(a,b)=>Boolean(a&&b&&
    Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&
    Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2);
   const noOverlap=(x,y,label)=>assert.equal(overlaps(diag[x],diag[y]),false,
    'F34 solapamiento móvil '+label+' en '+chapter.title+' '+size.name+
     ': '+JSON.stringify({[x]:diag[x],[y]:diag[y]}));
   noOverlap('brand','stats','marca/estadísticas');
   noOverlap('pause','stats','pausa/estadísticas');
   noOverlap('pause','objective','pausa/objetivo');
   noOverlap('stats','objective','estadísticas/objetivo');
   if(size.height>=520){
    noOverlap('prompt','stamina','instrucción/resistencia');
    noOverlap('inventory','stamina','mochila/resistencia');
    noOverlap('controls','stamina','manual/resistencia');
    if(diag.toastShown){
     noOverlap('toast','stamina','narrativa/resistencia');
     noOverlap('toast','prompt','narrativa/instrucción');
     noOverlap('toast','objective','narrativa/objetivo');
    }
   }
   assert.equal(diag.graphicsShown,false,'Etiqueta de gráficos redundante tapa HUD móvil');
   assert.equal(diag.artShown,false,'Etiqueta de arte redundante tapa HUD móvil');
  }
  assert.deepEqual(errors,[],'Errores en capítulo '+chapter.title);
  const file='f33-'+String(index+1).padStart(2,'0')+'-'+size.name+'.png';
  await page.screenshot({path:resolve('artifacts',file)});
  report.cases.push({chapter:chapter.id,screen:size.name,shot:file,...diag,errors:0});
  console.log('PASS F33 VISUAL '+chapter.id+' '+size.name+' · '+diag.statusText);
 }finally{await page.close();}
}
try{
 await serverReady();mkdirSync('artifacts',{recursive:true});
 browser=await chromium.launch({headless:true,args:[
  '--enable-webgl','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader'
 ]});
 for(let i=0;i<chapters.length;i++)
  for(const size of sizes)await screenshotScene(chapters[i],i,size);
 assert.equal(report.cases.length,18);
 report.passed=true;
 console.log('PASS F34: 6 capítulos × 3 viewports, 18 capturas, HUD móvil sin superposiciones y 0 errores JS');
}catch(e){
 report.passed=false;report.failure=String(e instanceof Error?e.stack:e);
 console.error('FAIL F33:',e);
 console.error('Preview: '+output.slice(-1000));
 process.exitCode=1;
}finally{
 report.finished=new Date().toISOString();
 mkdirSync('artifacts',{recursive:true});
 writeFileSync(resolve('artifacts','f33-visual-report.json'),JSON.stringify(report,null,2)+'\n');
 await browser?.close();
 if(server.pid){
  if(process.platform==='win32')
   spawnSync('taskkill',['/PID',String(server.pid),'/T','/F'],{stdio:'ignore'});
  else{try{process.kill(-server.pid,'SIGTERM');}catch{server.kill('SIGTERM');}}
 }
}
