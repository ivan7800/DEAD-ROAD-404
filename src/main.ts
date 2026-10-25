import {InputController,capturesGameKey,normalizeKey} from './inputController.ts';
import {safeStorage,readPreference,writePreference,writeSave,readLatestValidSave} from './saveStorage.ts';
import {shouldOfferFinale,resolveFinale,roadObjective,ENDINGS,FINALE_OPTIONS,type FinalApproach} from './roadStory.ts';
import {stepArcadeDrive} from './arcadeDrive.ts';
import {roadEdgeImpact,repairVehicle} from './vehicleWear.ts';
import {beginChapterOne,chapterOneObjective,nearChapterProp,collectChapterFuse,powerChapterConsole,tuneChapterFrequency,openChapterHatch,defeatChapterWarden,closeChapterOne,FUSE_POSITION,CONSOLE_POSITION,HATCH_POSITION,FREQUENCIES,type ChapterOneDecision} from './chapterOne.ts';
import {freshWarden,stepWarden,strikeWarden} from './warden.ts';
import {ITEMS,addItem,inventoryTotal,useItem,openSupplyCache,CACHE_POSITION,type ItemId} from './inventory.ts';
import {CHAPTERS,MILESTONES,campaignStatus,recordMilestone} from './campaign.ts';
import {walkWithSlide} from './worldCollision.ts';
import {answerPhone,canAnswerPhone,isAtPhone} from './phone1992.ts';
import {normalizeFilmLook,toggleFilmLook,allowAnalogMotion,type FilmLook} from './filmLook.ts';
import * as THREE from 'three';
import {stepStamina,canSprint,movementSpeed,explorationHint} from './exploration.ts';
import './style.css';
import {isNearTape,collectTape,motelCollision} from './motel.ts';
import {GameWorld} from './scene.ts';
import {graphicsPreset,nextGraphicsPreset,GRAPHICS,type GraphicsPreset} from './quality.ts';
import {AudioDirector} from './audioDirector.ts';
import {FrameMetrics} from './performance.ts';
import {AdaptiveQuality} from './adaptiveQuality.ts';
import {advanceMission,missionObjective,MISSION_CHOICES,type MissionChoice} from './mission.ts';
import {createEnemy,updateEnemy,strike,type EnemyState} from './combat.ts';
import {ENCOUNTER,resolveEncounter,shouldOfferEncounter,type EncounterChoice} from './encounters.ts';
import {updateDrivingCamera} from './cameras.ts';
import {nextCamera,validCamera,CAMERA_LABELS,type CameraMode} from './cameraModes.ts';
import {fresh,travel,pickFuel,normalizeSave,clamp,type GameState,type Mode} from './state.ts';
const SAVE_KEY='dead-road-404-f19-v2';const PHASE18_SAVE_KEY='dead-road-404-f18-v2';const PHASE17_SAVE_KEY='dead-road-404-f17-v2';const PHASE16_SAVE_KEY='dead-road-404-f16-v2';const LEGACY_SAVE_KEY='dead-road-404-f15-v2';const PRIOR_SAVE_KEY='dead-road-404-f14-v2';const OLDER_SAVE_KEY='dead-road-404-f13-v2';const ORIGINAL_SAVE_KEY='dead-road-404-v2';
const store=safeStorage();
const $=(id:string)=>document.getElementById(id)!;
const canvas=$('scene') as HTMLCanvasElement,world=new GameWorld(canvas);
let graphics:GraphicsPreset=graphicsPreset(readPreference(store,'dead-road-404-psx-graphics'));world.setGraphics(graphics);
let headlights=true;let flashlightOn=false;let stamina=100;let journalOpen=false;let inventoryOpen=false;let warden=freshWarden();let state:GameState=fresh(),mode:Mode='map',yaw=0,pitch=0,carYaw=0,speed=0,elapsed=0,last=performance.now(),toastUntil=0;
let cameraMode:CameraMode=validCamera(readPreference(store,'dead-road-404-camera'));
let filmLook:FilmLook=normalizeFilmLook(readPreference(store,'dead-road-404-film-look'));
let steering=0;let helpOpen=false;let impactCooldown=0;
function applyFilmLook(){document.documentElement.classList.toggle('perf-mode',true);document.documentElement.classList.add('psx-mode');const overlay=$('analog-overlay');const enabled=filmLook==='suave'&&graphics!=='psx';overlay.classList.toggle('disabled',!enabled);overlay.classList.toggle('static-only',!allowAnalogMotion(enabled,window.matchMedia('(prefers-reduced-motion: reduce)').matches||graphics==='rendimiento'));$('analog-label').textContent='ESTÉTICA PSX · 1992';}
applyFilmLook();
const soundscape=new AudioDirector();const metrics=new FrameMetrics();const adaptiveQuality=new AdaptiveQuality();let showPerformance=false;let lastMetrics=0;let encounterOpen=false;let enemy:EnemyState=createEnemy();let attackCooldown=0;
const keyPosition=new THREE.Vector3(17.2,1.7,-8.4),veraPosition=new THREE.Vector3(-20,1.7,-40.5),radioPosition=new THREE.Vector3(14.4,1.7,-2.4);
const input=new InputController(),keys=input.keys, panel=$('panel'),status=$('status'),prompt=$('prompt'),cross=$('crosshair');
const addLog=(message:string)=>{$('log').textContent=message;};
$('art-status').textContent='ARTE PSX · 240P · SIN GLB PESADOS';
function beep(freq:number,duration=.12){soundscape.beep(freq,duration);}
function notify(message:string){$('toast').textContent=message;$('toast').classList.add('show');toastUntil=performance.now()+3400;addLog(message);}
function hud(){$('graphics-label').textContent='GRÁFICOS: '+GRAPHICS[graphics].label+' · [G] CAMBIAR';const text=`🪓 ${enemy.alive?'AMENAZA':'DESPEJADO'}  |  ⛽ ${state.fuel.toFixed(1)} L  |  🍞 ${state.food}  |  ♥ ${state.health}  |  🔧 ${state.parts}  |  🚗 ${state.carCondition.toFixed(0)}%  |  ${state.km} km  |  🎒 ${inventoryTotal(state.inventory)} objetos`;$('stats').textContent=text;$('camera-label').textContent=mode==='drive'?`CÁMARA: ${CAMERA_LABELS[cameraMode]} · [C] CAMBIAR · [L] LUCES`:'';$('dashboard').classList.toggle('visible',mode==='drive');$('stamina-wrap').classList.toggle('visible',mode==='explore');$('objective').textContent=(chapterOneObjective(state)||roadObjective(state)||missionObjective(state.mission))+(mode==='explore'?' · [F] atacar · [E] interactuar':mode==='drive'?' · [C] cámara · [L] luces':' · Explora y completa la misión');}
function switchMode(next:Mode){input.reset();if(helpOpen){helpOpen=false;$('controls-guide').classList.add('hidden');}if(journalOpen){journalOpen=false;$('journal').classList.add('hidden');}if(inventoryOpen){inventoryOpen=false;$('inventory-panel').classList.add('hidden');}mode=next;state.mode=mode;panel.classList.toggle('hidden',mode!=='map');cross.style.display=mode==='explore'?'block':'none';status.textContent=next==='map'?'CARRETERA':next==='drive'?'FIREBIRD · CONDUCCIÓN':'A PIE · EXPLORACIÓN';prompt.textContent='';if(next!=='explore')document.exitPointerLock?.();if(next==='explore'){world.player.set(6,1.7,6);yaw=Math.PI/2;pitch=0;}else if(next==='drive'){carYaw=0;speed=0;steering=0;world.car.position.set(state.carX,.18,state.carZ);}world.setMode(next,state.carX,state.carZ,carYaw);world.setMissionStage(state.mission.stage);world.setTapeVisible(!state.motelTape);world.setCacheVisible(!state.supplyCacheTaken);world.setChapterOneStage(state.chapterOne.stage);hud();}
function toggleHelp(){helpOpen=!helpOpen;$('controls-guide').classList.toggle('hidden',!helpOpen);input.reset();document.exitPointerLock?.();if(helpOpen)$('close-controls').focus();}
$('show-controls').addEventListener('click',toggleHelp);$('close-controls').addEventListener('click',toggleHelp);
function toggleJournal(){
 journalOpen=!journalOpen;
 const journal=$('journal');journal.classList.toggle('hidden',!journalOpen);
 $('journal-stage').textContent=chapterOneObjective(state)||roadObjective(state)||missionObjective(state.mission);
 $('journal-record').textContent=(state.motelTape?'CINTA DEL MOTEL: Recuperada · +1 pieza y +2 comida.\n':'')+(state.phoneHeard?'CABINA TELEFÓNICA: la voz conocía una fecha que todavía no ha llegado.\n':'')+(state.mission.stage==='resolved' ? 'Decisión registrada: '+({rescue:'Vera viaja contigo',take:'Cobraste por ayudar',leave:'Vera permanece en el motel'}[state.mission.choice!]||'Desconocida') : 'Pista: los secretos de la estación se descubren explorando y escuchando.');
 const chapters=$('journal-chapters');chapters.replaceChildren();
 for(const chapter of CHAPTERS){
  const row=document.createElement('div');
  const progress=campaignStatus(state.campaign,chapter.id);
  row.className='journal-chapter '+progress;
  const status=progress==='completed'?'COMPLETADO':progress==='active'?'EN CURSO':progress==='available'?'DISPONIBLE':'BLOQUEADO · PRÓXIMO CAPÍTULO';
  const title=document.createElement('strong');title.textContent=chapter.number+' · '+chapter.title+' · '+status;
  const setting=document.createElement('small');setting.textContent=chapter.setting;
  row.append(title,setting);chapters.append(row);
 }
 const timeline=$('journal-timeline');timeline.replaceChildren();
 if(state.campaign.milestones.length===0){
  const empty=document.createElement('p');empty.textContent='Todavía no has registrado pistas.';timeline.append(empty);
 }else{
  for(const id of state.campaign.milestones){
   const item=document.createElement('p');item.textContent='▸ '+MILESTONES[id];timeline.append(item);
  }
 }
 if(journalOpen){keys.clear();document.exitPointerLock?.();}
}

function renderInventory(){
 const list=$('inventory-list');list.replaceChildren();
 let shown=0;
 for(const [id,item] of Object.entries(ITEMS) as Array<[ItemId,(typeof ITEMS)[ItemId]]>){
  const quantity=state.inventory[id];if(quantity<=0)continue;
  shown++;
  const row=document.createElement('div');row.className='inventory-item';
  const description=document.createElement('div');
  const title=document.createElement('strong');title.textContent=item.name+' ×'+quantity;
  const detail=document.createElement('small');detail.textContent=item.description;
  description.append(title,detail);
  const use=document.createElement('button');use.type='button';
  use.textContent=item.kind==='quest'?'PISTA':'UTILIZAR';use.disabled=item.kind==='quest';
  use.addEventListener('click',()=>{
   const result=useItem(state,id);
   if(result.used){state=result.state;saveQuietly();hud();renderInventory();}
   notify(result.message);
  });
  row.append(description,use);list.append(row);
 }
 if(!shown){const empty=document.createElement('p');empty.textContent='La mochila está vacía. Explora SUNSPUR en busca de suministros.';list.append(empty);}
 $('inventory-description').textContent='Capítulo '+CHAPTERS.find(x=>x.id===state.campaign.current)!.number+' · '+inventoryTotal(state.inventory)+' objetos · Los objetos de historia no se consumen.';
}
function toggleInventory(){
 if(encounterOpen||helpOpen)return;
 inventoryOpen=!inventoryOpen;
 $('inventory-panel').classList.toggle('hidden',!inventoryOpen);
 if(inventoryOpen){
  if(journalOpen){journalOpen=false;$('journal').classList.add('hidden');}
  input.reset();document.exitPointerLock?.();renderInventory();
  ($('inventory-close') as HTMLButtonElement).focus();
 }else{($('inventory-access') as HTMLButtonElement).focus();}
}
$('inventory-access').addEventListener('click',toggleInventory);
$('inventory-open').addEventListener('click',toggleInventory);
$('inventory-close').addEventListener('click',toggleInventory);
function showEncounter(){if(!shouldOfferEncounter(state)||encounterOpen)return;encounterOpen=true;input.reset();document.exitPointerLock?.();const dialog=$('encounter');$('encounter-title').textContent=ENCOUNTER.title;$('encounter-text').textContent=ENCOUNTER.intro;const choices=$('encounter-choices');choices.replaceChildren();for(const option of ENCOUNTER.choices){const btn=document.createElement('button');btn.type='button';btn.textContent=option.label;btn.addEventListener('click',()=>{const next=resolveEncounter(state,option.id as EncounterChoice);if(!next.encounterResolved){notify(next.message);return;}state=next;state.campaign=recordMilestone(state.campaign,'traveller');saveQuietly();encounterOpen=false;dialog.classList.add('hidden');notify(next.message);hud();});choices.append(btn);}dialog.classList.remove('hidden');(choices.querySelector('button') as HTMLButtonElement|null)?.focus();}
function showMissionDialogue(){if(encounterOpen)return;encounterOpen=true;input.reset();document.exitPointerLock?.();const dialog=$('encounter');$('encounter-title').textContent='VERA · LA ÚLTIMA CLIENTA';$('encounter-text').textContent='«El tipo de la radio llevaba muerto dos días antes de hablar. Tengo un mapa que no debería existir. ¿Me llevas o nos cobramos mutuamente por respirar?»';const choices=$('encounter-choices');choices.replaceChildren();for(const opt of MISSION_CHOICES){const b=document.createElement('button');b.type='button';b.textContent=opt.label+' — '+opt.description;b.addEventListener('click',()=>{const prior=state.mission;state.mission=advanceMission(prior,'talk',opt.id as MissionChoice);if(state.mission.stage==='resolved'&&prior.stage!=='resolved'){state.campaign=recordMilestone(state.campaign,'vera');if(opt.id==='rescue'){state.food=Math.max(0,state.food-3);state.parts+=1;}else if(opt.id==='take'){state.parts+=2;state.health=Math.max(0,state.health-10);}else state.food+=5;state=beginChapterOne(state);notify('DECISIÓN SOBRE VERA · '+opt.label+' · '+state.message);save();}encounterOpen=false;dialog.classList.add('hidden');hud();if(shouldOfferFinale(state))showFinale();});choices.append(b);}dialog.classList.remove('hidden');(choices.firstChild as HTMLButtonElement|null)?.focus();}
function showFinale(){
 if(!shouldOfferFinale(state)||encounterOpen)return;
 encounterOpen=true;input.reset();document.exitPointerLock?.();
 const dialog=$('encounter'),choices=$('encounter-choices');
 $('encounter-title').textContent='CARRETERA 404 · ÚLTIMO DESVÍO';
 $('encounter-text').textContent='Son las 02:17. Otra vez. El asfalto se divide en dos: una salida sin señales y una antena que emite tu propia voz. Vera te mira en silencio. ¿Qué haces?';
 choices.replaceChildren();
 for(const option of FINALE_OPTIONS){
  const button=document.createElement('button');button.type='button';button.textContent=option.label+' — '+option.description;
  button.addEventListener('click',()=>{
   state=resolveFinale(state,option.id as FinalApproach);
   const ending=state.ending?ENDINGS[state.ending]:null;
   if(!ending)return;
   $('encounter-title').textContent=ending.title;
   $('encounter-text').textContent=ending.text;
   choices.replaceChildren();saveQuietly();hud();
   const close=document.createElement('button');close.type='button';close.textContent='GUARDAR FINAL Y REGRESAR AL MENÚ';
   close.addEventListener('click',()=>{encounterOpen=false;dialog.classList.add('hidden');switchMode('map');notify('FINAL REGISTRADO · '+ending.title);});
   choices.append(close);close.focus();
  });choices.append(button);
 }
 dialog.classList.remove('hidden');(choices.firstChild as HTMLButtonElement|null)?.focus();
}

function showFrequencyPuzzle(){
 if(encounterOpen||state.chapterOne.stage!=='tuning')return;
 encounterOpen=true;input.reset();document.exitPointerLock?.();
 const dialog=$('encounter'),choices=$('encounter-choices');
 $('encounter-title').textContent='SUNSPUR · EL CUADRO DE LA FRECUENCIA';
 $('encounter-text').textContent='La pantalla muestra 170, 217 y 404 kHz. En la carcasa alguien ha escrito: «La hora permanece detenida». ¿Qué frecuencia envía la señal al motel?';
 choices.replaceChildren();
 for(const frequency of FREQUENCIES){
  const button=document.createElement('button');button.type='button';button.textContent=frequency+' kHz';
  button.addEventListener('click',()=>{
   state=tuneChapterFrequency(state,frequency);hud();notify(state.message);beep(frequency,.15);
   if(state.chapterOne.stage==='hatch'){
    saveQuietly();encounterOpen=false;dialog.classList.add('hidden');
    world.setChapterOneStage(state.chapterOne.stage);
    return;
   }
   $('encounter-text').textContent=state.message+' · INTENTOS: '+state.chapterOne.attempts;
  });choices.append(button);
 }
 const back=document.createElement('button');back.type='button';back.textContent='VOLVER A EXPLORAR';
 back.addEventListener('click',()=>{encounterOpen=false;dialog.classList.add('hidden');});
 choices.append(back);dialog.classList.remove('hidden');(choices.firstChild as HTMLButtonElement|null)?.focus();
}
function showChapterOneDecision(){
 if(encounterOpen||state.chapterOne.stage!=='choice')return;
 encounterOpen=true;input.reset();document.exitPointerLock?.();
 const dialog=$('encounter'),choices=$('encounter-choices');
 $('encounter-title').textContent='CAPÍTULO I · LA ÚLTIMA TRANSMISIÓN';
 $('encounter-text').textContent='El Celador ha caído. Entre los cables hay una cinta con la voz de Vera y otra con la tuya. El transmisor aún funciona. ¿Qué haces con la señal?';
 choices.replaceChildren();
 const options:ReadonlyArray<{id:ChapterOneDecision;label:string}>=[
  {id:'destroy',label:'QUEMAR LA TRANSMISIÓN · +20 SALUD'},
  {id:'preserve',label:'CONSERVAR LA CINTA · +2 PIEZAS'}
 ];
 for(const option of options){
  const b=document.createElement('button');b.type='button';b.textContent=option.label;
  b.addEventListener('click',()=>{
   state=closeChapterOne(state,option.id);saveQuietly();
   world.setChapterOneStage(state.chapterOne.stage);hud();notify(state.message);
   $('encounter-title').textContent='CAPÍTULO I COMPLETADO · LA ÚLTIMA PARADA';
   $('encounter-text').textContent=state.message+' El Firebird aguarda. Fuera, la carretera continúa hasta un desvío que no figura en el mapa.';
   choices.replaceChildren();
   const close=document.createElement('button');close.type='button';close.textContent='REGRESAR AL FIREBIRD';
   close.addEventListener('click',()=>{
    encounterOpen=false;dialog.classList.add('hidden');switchMode('map');if(shouldOfferFinale(state))showFinale();
   });choices.append(close);close.focus();
  });choices.append(b);
 }
 dialog.classList.remove('hidden');(choices.firstChild as HTMLButtonElement|null)?.focus();
}
function save(){if(writeSave(store,SAVE_KEY,{...state,mode:'map'}))notify('Partida guardada. La carretera no olvidará.');else notify('No se pudo guardar. Revisa permisos o almacenamiento.');}
function saveQuietly(){if(!writeSave(store,SAVE_KEY,{...state,mode:'map'}))notify('El evento se ha registrado en memoria, pero no se pudo guardar en disco.');}
function load(){try{const s=readLatestValidSave(store,[SAVE_KEY,PHASE18_SAVE_KEY,PHASE17_SAVE_KEY,PHASE16_SAVE_KEY,LEGACY_SAVE_KEY,PRIOR_SAVE_KEY,OLDER_SAVE_KEY,ORIGINAL_SAVE_KEY],normalizeSave);if(!s){notify('No hay partida válida.');return;}state=s;enemy={...createEnemy(),health:state.enemyHealth,alive:state.enemyHealth>0};warden=freshWarden(state.chapterOne.wardenHealth);switchMode('map');world.setTapeVisible(!state.motelTape);world.setCacheVisible(!state.supplyCacheTaken);notify('Partida recuperada.');if(shouldOfferEncounter(state))showEncounter();else if(shouldOfferFinale(state))showFinale();}catch{notify('El guardado está dañado o no es accesible.');}}
$('drive').addEventListener('click',()=>{try{soundscape.start();}catch{}if(state.ending){notify('Historia concluida · Empieza una nueva partida para volver a la carretera.');return;}if(state.carCondition<=0){notify('Repara el Firebird antes de conducir.');return;}if(state.fuel<2){notify('Te falta gasolina. Explora la gasolinera.');return;}switchMode('drive');notify('Gira la llave. El V8 ruge bajo un cielo sin estrellas.');});
$('explore').addEventListener('click',()=>{try{soundscape.start();}catch{}state.visited=true;state.campaign=recordMilestone(state.campaign,'station');switchMode('explore');notify('La puerta de la estación golpea tres veces. No hay viento.');});
$('repair').addEventListener('click',()=>{state=repairVehicle(state);notify(state.message);hud();});
$('save').addEventListener('click',save);$('load').addEventListener('click',load);$('new').addEventListener('click',()=>{enemy=createEnemy();state=fresh();warden=freshWarden();world.setTapeVisible(true);world.setCacheVisible(true);switchMode('map');notify('Nueva partida. Las malas decisiones todavía están por llegar.');});
window.addEventListener('keydown',e=>{
 const k=normalizeKey(e.key);
 const target=e.target as HTMLElement|null;
 if(target?.matches('input,textarea,select,[contenteditable="true"]'))return;
 if(capturesGameKey(k,mode) && !target?.closest('button'))e.preventDefault();
 // Modal dialogs own the keyboard; keys never leak back into gameplay.
 if(inventoryOpen){if(!e.repeat&&(k==='i'||k==='escape'))toggleInventory();return;}
 if(helpOpen){if(!e.repeat&&(k==='h'||k==='escape'))toggleHelp();return;}
 if(encounterOpen){input.reset();return;}
 if(journalOpen){if(!e.repeat&&(k==='j'||k==='escape'))toggleJournal();return;}
 if(k==='h'&&!e.repeat){toggleHelp();return;}
 if(mode!=='map'||!['w','a','s','d',' ','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(k))input.press(k);
 if(e.repeat)return;
if(k==='i'&&!encounterOpen){toggleInventory();return;}if(k==='j'&&!encounterOpen){toggleJournal();return;}if(journalOpen){if(k==='escape')toggleJournal();return;}if(encounterOpen)return;if(k==='m'){state.carX=clamp(world.car.position.x,-3.7,3.7);state.carZ=clamp(world.car.position.z,-150,24);switchMode('map');}if(k==='p')save();if(k==='f3'){showPerformance=!showPerformance;$('perf-panel').classList.toggle('hidden',!showPerformance);notify(showPerformance?'Diagnóstico de rendimiento activado.':'Diagnóstico de rendimiento oculto.');}if(k==='v'){filmLook=toggleFilmLook(filmLook);writePreference(store,'dead-road-404-film-look',filmLook);applyFilmLook();notify(filmLook==='suave'?'Filtro VHS suave activado.':'Filtro VHS desactivado.');return;}if(k==='g'){adaptiveQuality.defer(performance.now());graphics=nextGraphicsPreset(graphics);world.setGraphics(graphics);applyFilmLook();writePreference(store,'dead-road-404-psx-graphics',graphics);notify('Calidad visual: '+GRAPHICS[graphics].label);hud();}if(k==='c'&&mode==='drive'){cameraMode=nextCamera(cameraMode);writePreference(store,'dead-road-404-camera',cameraMode);notify('Cámara: '+CAMERA_LABELS[cameraMode]);}if(k==='t'&&mode==='explore'){flashlightOn=!flashlightOn;notify(flashlightOn?'Linterna encendida. La oscuridad retrocede.':'Linterna apagada.');}if(k==='l'&&mode==='drive'){headlights=!headlights;world.firebird.setHeadlights(headlights);notify(headlights?'Faros encendidos':'Faros apagados');}if(k==='r'&&mode==='explore'){if(world.player.distanceTo(radioPosition)<4){state.mission=advanceMission(state.mission,'radio');state.campaign=recordMilestone(state.campaign,'radio');saveQuietly();notify('RADIO 404: «Vera está en el motel. La llave está tras las neveras». Una voz idéntica a la tuya.');hud();}else notify('Solo escuchas estática. La radio está detrás del mostrador.');}if(k==='e'&&mode==='explore'){
 const px=world.player.x,pz=world.player.z;
 if(state.chapterOne.stage==='fuse'&&nearChapterProp(px,pz,FUSE_POSITION)){
  state=collectChapterFuse(state);saveQuietly();world.setChapterOneStage(state.chapterOne.stage);
  notify(state.message);hud();
 }else if(state.chapterOne.stage==='panel'&&nearChapterProp(px,pz,CONSOLE_POSITION)){
  state=powerChapterConsole(state);saveQuietly();world.setChapterOneStage(state.chapterOne.stage);
  notify(state.message);hud();showFrequencyPuzzle();
 }else if(state.chapterOne.stage==='tuning'&&nearChapterProp(px,pz,CONSOLE_POSITION)){
  showFrequencyPuzzle();
 }else if(state.chapterOne.stage==='hatch'&&nearChapterProp(px,pz,HATCH_POSITION,2.7)){
  state=openChapterHatch(state);warden=freshWarden(state.chapterOne.wardenHealth);
  saveQuietly();world.setChapterOneStage(state.chapterOne.stage);
  notify(state.message);hud();beep(72,.45);
 }else if(!state.supplyCacheTaken&&Math.hypot(px-CACHE_POSITION.x,pz-CACHE_POSITION.z)<2.2){
 const cache=openSupplyCache(state);state=cache.state;
 state.campaign=recordMilestone(state.campaign,'cache');
 world.setCacheVisible(false);saveQuietly();notify(cache.message);hud();
 }else if(isAtPhone(world.player.x,world.player.z)){const result=answerPhone(state.mission.stage,state.phoneHeard);if(canAnswerPhone(state.mission.stage,state.phoneHeard)){state.phoneHeard=true;state.campaign=recordMilestone(state.campaign,'phone');saveQuietly();beep(450,.12);}notify(result.message);hud();}else if(!state.motelTape&&isNearTape(world.player.x,world.player.z)){const result=collectTape(state);state={...state,motelTape:result.motelTape,parts:result.parts,food:result.food,inventory:addItem(state.inventory,'motelTape')};state.campaign=recordMilestone(state.campaign,'tape');world.setTapeVisible(false);saveQuietly();notify('CINTA MAGNÉTICA: «Las habitaciones no tienen número. Tienen fecha». +2 comida y +1 pieza.');hud();}else if(world.player.distanceTo(veraPosition)<4&&state.mission.stage==='key'){showMissionDialogue();}else if(world.player.distanceTo(keyPosition)<3&&state.mission.stage==='signal'){state.mission=advanceMission(state.mission,'key');state.inventory=addItem(state.inventory,'key404');state.campaign=recordMilestone(state.campaign,'key');saveQuietly();notify('Obtienes la LLAVE 404. En su etiqueta pone: «NO ABRIR DESDE DENTRO».');hud();}else if(world.player.distanceTo(new THREE.Vector3(11,1.7,1))<3){const old=state.hasCan;state=pickFuel(state);if(!old)notify(state.message);else notify('Ya recogiste el bidón.');hud();}else notify('No hay nada a tu alcance.');}if((k===' '||k==='f')&&mode==='explore'&&attackCooldown===0&&state.health>0){
 attackCooldown=.48;
 if(state.chapterOne.stage==='fight'&&Math.hypot(world.player.x-warden.x,world.player.z-warden.z)<3.3){
  const hit=strikeWarden(warden,world.player.x,world.player.z,yaw);
  warden=hit.warden;state.chapterOne={...state.chapterOne,wardenHealth:warden.health};
  beep(hit.hit?85:195,.18);world.flashHit(hit.hit);
  if(hit.hit){
   saveQuietly();notify(hit.defeated?'EL CELADOR CAE · La escotilla se queda abierta.':
    'EL CELADOR · '+warden.health+'/120 · Retrocede y esquiva su ataque anunciado.');
   if(hit.defeated){state=defeatChapterWarden(state);world.setWarden(warden.x,warden.z,false,false,elapsed);world.setChapterOneStage(state.chapterOne.stage);saveQuietly();hud();showChapterOneDecision();}
  }else notify('El golpe no alcanza al Celador. Acércate y míralo de frente.');
 }else{
  const result=strike(enemy,world.player.x,world.player.z,25,yaw);
  enemy=result.enemy;state.enemyHealth=enemy.health;beep(result.hit?90:200,.14);world.flashHit(result.hit);
  notify(result.defeated?'El vigilante se desploma. Entre sus dientes hay arena.':result.hit?'Golpe certero. El vigilante retrocede.':'Tu golpe corta el aire.');
 }
}if(k==='escape'&&mode==='drive')switchMode('map');});
window.addEventListener('keyup',e=>input.release(e.key));window.addEventListener('blur',()=>{input.reset();metrics.reset();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)input.reset();});canvas.addEventListener('click',()=>{try{soundscape.start();}catch{}if(mode==='explore'&&document.pointerLockElement!==canvas)canvas.requestPointerLock?.();});document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas&&mode==='explore'){yaw-=e.movementX*.0022;pitch=clamp(pitch-e.movementY*.0018,-1.1,1.1);}});
function update(dt:number){soundscape.update(mode,speed);elapsed+=dt;attackCooldown=Math.max(0,attackCooldown-dt);if(encounterOpen||journalOpen||helpOpen||inventoryOpen)return;if(mode==='drive'){const accel=input.axis(['w','arrowup'],['s','arrowdown']);
 const turn=input.axis(['a','arrowleft'],['d','arrowright']);
 const handbrake=keys.has(' ');
 const drive=stepArcadeDrive({speed,heading:carYaw,steering},{throttle:state.fuel>0&&state.carCondition>0?accel:0,steer:turn,handbrake},dt);
 speed=drive.speed;carYaw=drive.heading;steering=drive.steering;
 const oldZ=world.car.position.z,oldX=world.car.position.x;
 const desiredX=oldX-Math.sin(carYaw)*speed*dt;
 world.car.position.x=clamp(desiredX,-3.7,3.7);
 world.car.position.z=clamp(oldZ-Math.cos(carYaw)*speed*dt,-150,24);
 const impact=roadEdgeImpact({condition:state.carCondition,cooldown:impactCooldown},speed,desiredX<-3.7||desiredX>3.7,dt);
 impactCooldown=impact.cooldown;state.carCondition=impact.condition;if(impact.hit){speed=impact.speed;notify('¡Golpe contra el arcén! Firebird: '+Math.round(state.carCondition)+'%');}
 if(state.carCondition<=0){speed=0;switchMode('map');notify('Firebird averiado · Repara con piezas antes de continuar.');}
 world.car.rotation.y=carYaw;state.carX=world.car.position.x;state.carZ=world.car.position.z;const moved=Math.hypot(world.car.position.z-oldZ,world.car.position.x-oldX);state.fuel=clamp(state.fuel-moved*.00028,0,80);world.updateCarVisual(dt,speed,steering,state.fuel,input.down('s','arrowdown',' '));updateDrivingCamera(world.camera,world.car,cameraMode,dt);const kmh=Math.abs(speed)*3.6;$('speed-number').textContent=String(Math.round(kmh));$('fuel-number').textContent=state.fuel.toFixed(0);$('speed-needle').style.transform=`rotate(${Math.min(130,kmh/150*260-130)}deg)`;$('fuel-needle').style.transform=`rotate(${(state.fuel/80)*200-100}deg)`;if(world.car.position.z<=-125){state=travel(state,24);world.car.position.z=20;state.carZ=20;switchMode('map');notify(state.message);if(shouldOfferEncounter(state))showEncounter();else if(shouldOfferFinale(state))showFinale();}}
 if(mode==='explore'){world.setFlashlight(flashlightOn,yaw,pitch);world.setMissionStage(state.mission.stage);const previousEnemy=enemy;const observed=updateEnemy(enemy,world.player.x,world.player.z,dt);enemy=observed.enemy;if(observed.hit&&state.health>0){state.health=clamp(state.health-9,0,100);beep(60,.28);world.flashDanger();notify(state.health===0?'Has caído. Pulsa M para reorganizarte.':'¡El vigilante te alcanza! -9 salud.');}world.setEnemy(enemy.x,enemy.z,enemy.alive,elapsed,Math.min(1,Math.hypot(enemy.x-previousEnemy.x,enemy.z-previousEnemy.z)/Math.max(.001,dt)));
 if(state.chapterOne.stage==='fight'){
  const result=stepWarden(warden,world.player.x,world.player.z,dt);warden=result.warden;
  if(result.hit&&state.health>0){
   state.health=clamp(state.health-13,0,100);world.flashDanger();beep(65,.24);
   notify(state.health===0?'El Celador te ha vencido. Usa un botiquín desde [I] o regresa al Firebird [M].':'¡EL CELADOR TE ALCANZA! −13 salud. Esquiva cuando su ojo brille.');
   saveQuietly();
  }
  world.setWarden(warden.x,warden.z,true,warden.phase==='telegraph',elapsed);
 }else world.setWarden(warden.x,warden.z,false,false,elapsed);
 const forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);const strafe=(keys.has('d')?1:0)-(keys.has('a')?1:0);if(document.pointerLockElement!==canvas){if(keys.has('arrowleft'))yaw+=dt*1.6;if(keys.has('arrowright'))yaw-=dt*1.6;}const dir=new THREE.Vector3(Math.sin(yaw)*forward+Math.cos(yaw)*strafe,0,-Math.cos(yaw)*forward+Math.sin(yaw)*strafe);const moving=dir.lengthSq()>0;const sprinting=canSprint(stamina,moving,keys.has('shift'));stamina=stepStamina(stamina,sprinting,dt);$('stamina-bar').style.width=stamina.toFixed(1)+'%';$('stamina-value').textContent=Math.round(stamina)+'%';if(moving)dir.normalize().multiplyScalar(dt*movementSpeed(sprinting));const position=walkWithSlide(world.player.x,world.player.z,dir.x,dir.z,motelCollision);
 world.player.x=position.x;world.player.z=position.z;world.camera.position.copy(world.player);world.camera.rotation.order='YXZ';world.camera.rotation.set(pitch,yaw,0);$('exploration-tip').textContent=explorationHint(state.mission.stage,flashlightOn);prompt.textContent=state.chapterOne.stage==='fuse'&&nearChapterProp(world.player.x,world.player.z,FUSE_POSITION)?'[E] RECOGER FUSIBLE DEL GENERADOR':
 state.chapterOne.stage==='panel'&&nearChapterProp(world.player.x,world.player.z,CONSOLE_POSITION)?'[E] INSERTAR FUSIBLE EN CUADRO 404':
 state.chapterOne.stage==='tuning'&&nearChapterProp(world.player.x,world.player.z,CONSOLE_POSITION)?'[E] SINTONIZAR RADIO 02:17':
 state.chapterOne.stage==='hatch'&&nearChapterProp(world.player.x,world.player.z,HATCH_POSITION,2.7)?'[E] ABRIR ESCOTILLA DEL MOTEL':
 state.chapterOne.stage==='fight'&&Math.hypot(world.player.x-warden.x,world.player.z-warden.z)<5?'EL CELADOR · '+warden.health+'/120 · [F] ATACA · [SHIFT] ESQUIVA':
 !state.supplyCacheTaken&&Math.hypot(world.player.x-CACHE_POSITION.x,world.player.z-CACHE_POSITION.z)<2.2?'[E] REGISTRAR CAJA DE SUMINISTROS SUNSPUR':isAtPhone(world.player.x,world.player.z)?'[E] CABINA TELEFÓNICA · 1992':!state.motelTape&&isNearTape(world.player.x,world.player.z)?'[E] RECOGER CINTA DEL MOTEL':world.player.distanceTo(veraPosition)<4&&state.mission.stage==='key'?'[E] HABLAR CON VERA':world.player.distanceTo(keyPosition)<3&&state.mission.stage==='signal'?'[E] RECOGER LLAVE 404':world.player.distanceTo(radioPosition)<4&&state.mission.stage==='arrival'?'[R] ESCUCHAR TRANSMISIÓN':world.player.distanceTo(new THREE.Vector3(11,1.7,1))<3&&!state.hasCan?'[E] RECOGER BIDÓN DE GASOLINA':state.hasCan?'Bidón recogido · [ESPACIO] ATACAR · [M] FIREBIRD':'[CLICK] MIRAR · [ESPACIO] GOLPEAR · [R] RADIO · [M] FIREBIRD';}
 if(mode!=='drive')world.updateIdleEffects(dt);if(mode!=='explore')world.setFlashlight(false,yaw,pitch);if(mode==='map'){world.setEnemy(enemy.x,enemy.z,enemy.alive,elapsed);world.setWarden(warden.x,warden.z,false,false,elapsed);world.camera.fov=73;world.camera.updateProjectionMatrix();world.camera.position.lerp(new THREE.Vector3(28,19,32),Math.min(1,dt*2));world.camera.lookAt(8,0,0);}if(performance.now()>toastUntil)$('toast').classList.remove('show');}
function frame(now:number){const frameMs=now-last;const dt=Math.max(0,Math.min(frameMs/1000,.05));last=now;metrics.add(frameMs);update(dt);world.setAtmosphere(now/1000);world.render();const lower=adaptiveQuality.observe(now,metrics.fps(),metrics.count(),!document.hidden&&world.artStatus==='psx',graphics);if(lower){graphics=lower;world.setGraphics(graphics);metrics.reset();writePreference(store,'dead-road-404-psx-graphics',graphics);notify('FPS bajos: gráficos ajustados automáticamente a '+GRAPHICS[graphics].label+' · [G] cambiar');hud();}if(showPerformance&&now-lastMetrics>1000){lastMetrics=now;const info=world.renderer.info.render;$('perf-panel').textContent=`${metrics.fps().toFixed(1)} FPS (media móvil) · ${metrics.lowFps().toFixed(1)} FPS (1% bajo)  ·  ${info.calls} draw calls  ·  ${info.triangles} triángulos · DPR ${world.renderer.getPixelRatio().toFixed(2)} · LOTES ${world.sceneryBatch.merged+(world.artReport?.batchedMeshes??0)} · ${GRAPHICS[graphics].label}`;}if(Math.floor(now/250)!==Math.floor((now-dt*1000)/250))hud();requestAnimationFrame(frame);}switchMode('map');addLog(state.message);requestAnimationFrame(frame);
