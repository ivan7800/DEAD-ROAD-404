import {PULP_PREF_KEY,DEFAULT_PULP_SETTINGS,parsePulpSettings,normalizePulpSettings,shouldAnimatePulp,type PulpSettings,type PulpScreen} from './pulpSettings.ts';
import type {GraphicsPreset} from '../quality.ts';
import {readPreference,writePreference,type ReadStore,type WriteStore} from '../saveStorage.ts';

export type ChapterSummary={number:string;title:string;setting:string;status:'completed'|'active'|'available'|'locked'};
export interface PulpActions{
 storage:(ReadStore&WriteStore)|null;
 onSave:()=>void;onLoad:()=>void;onMenu:()=>void;
 getGraphics:()=>GraphicsPreset;setGraphics:(value:GraphicsPreset)=>void;
 getChapters:()=>ChapterSummary[];
 setVolume:(value:number)=>void;
 uiSound:(kind:'select'|'confirm'|'back'|'error')=>void;
}
const get=(id:string)=>document.getElementById(id)!;
const input=(id:string)=>get(id) as HTMLInputElement;
const select=(id:string)=>get(id) as HTMLSelectElement;
const BUTTON_IDS=['pulp-resume','pulp-pause-save','pulp-pause-load','pulp-options-from-pause','pulp-menu-from-pause',
 'pulp-options-open','pulp-chapters-open','pulp-credits-open','pulp-options-close','pulp-chapters-close',
 'pulp-credits-close','pulp-pause-access','pulp-reset-settings'] as const;
const SCREEN_IDS:Record<PulpScreen,string>={
 pause:'pulp-pause',options:'pulp-options',chapters:'pulp-chapters',credits:'pulp-credits'
};

/** Fully functional self-contained 90s interface subsystem.
 * The old menu buttons, story and saves are kept. Visual overlays never block clicks
 * during transitions; only intentional dialogs trap focus and suspend gameplay.
 */
export class PulpUI {
 private actions:PulpActions;
 private settings:PulpSettings;
 private screen:PulpScreen|null=null;
 private returnScreen:PulpScreen|null=null;
 private prevFocus:HTMLElement|null=null;
 private transitionTimer:number|undefined;
 private introTimer:number|undefined;
 private animationTimer:number|undefined;
 private mode:'map'|'drive'|'explore'='map';
 constructor(actions:PulpActions){
  this.actions=actions;
  this.settings=parsePulpSettings(readPreference(actions.storage,PULP_PREF_KEY));
  for(const id of BUTTON_IDS)if(!get(id))throw new Error('F24: falta '+id);
  this.bind();
  this.apply();
  this.setMode('map');
  this.startIntro();
 }
 get isPaused(){return this.screen!==null;}
 get currentScreen(){return this.screen;}
 get preferences():Readonly<PulpSettings>{return {...this.settings};}
 setGrain(enabled:boolean){this.update({grain:enabled});}
 get animationsEnabled(){
  return shouldAnimatePulp(this.settings.reducedMotion,window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 }
 setMode(mode:'map'|'drive'|'explore'){
  this.mode=mode;
  document.documentElement.dataset.pulpMode=mode;
  (get('pulp-pause-access') as HTMLButtonElement).hidden=mode==='map';
  if(mode==='map'&&this.screen==='pause')this.close();
 }
 open(screen:PulpScreen){
  if(this.screen===screen)return;
  if(this.screen!==null&&screen!=='options')this.close();
  if(this.screen===null)this.prevFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  this.returnScreen=screen==='options'&&this.screen==='pause'?'pause':null;
  this.screen=screen;
  for(const [key,id] of Object.entries(SCREEN_IDS))get(id).classList.toggle('hidden',key!==screen);
  document.documentElement.classList.add('pulp-modal-open');
  if(screen==='options')this.syncControls();
  if(screen==='chapters')this.renderChapters();
  this.actions.uiSound('confirm');
  const button=get(SCREEN_IDS[screen]).querySelector<HTMLElement>('button:not([disabled]),input,select');
  button?.focus();
 }
 close(){
  if(this.screen===null)return;
  if(this.screen==='options'&&this.returnScreen==='pause'){
   this.returnScreen=null;this.screen='pause';
   get('pulp-options').classList.add('hidden');get('pulp-pause').classList.remove('hidden');
   get('pulp-resume').focus();
   this.actions.uiSound('back');return;
  }
  for(const id of Object.values(SCREEN_IDS))get(id).classList.add('hidden');
  this.screen=null;this.returnScreen=null;
  document.documentElement.classList.remove('pulp-modal-open');
  this.prevFocus?.focus();
  this.actions.uiSound('back');
 }
 togglePause(){
  if(this.screen==='pause'){this.close();return;}
  if(this.screen!==null)return;
  if(this.mode==='map')return;
  this.open('pause');
 }
 /** Title cards avoid heavy WebGL postprocessing; brief opacity-only CSS on the DOM. */
 title(eyebrow:string,title:string,subtitle:string){
  const card=get('pulp-transition');
  get('pulp-transition-kicker').textContent=eyebrow;
  get('pulp-transition-title').textContent=title;
  get('pulp-transition-subtitle').textContent=subtitle;
  if(this.transitionTimer!==undefined)window.clearTimeout(this.transitionTimer);
  card.classList.remove('active');
  // restart animation without forcing synchronous reflow
  this.animationTimer=window.setTimeout(()=>{
   card.classList.add('active');
   this.transitionTimer=window.setTimeout(()=>card.classList.remove('active'),this.animationsEnabled?1100:80);
  },10);
  this.actions.uiSound('confirm');
 }
 flash(label:string){
  if(!this.animationsEnabled)return;
  const el=get('pulp-flash');el.textContent=label;el.classList.remove('active');
  if(this.animationTimer!==undefined)window.clearTimeout(this.animationTimer);
  this.animationTimer=window.setTimeout(()=>el.classList.add('active'),12);
  window.setTimeout(()=>el.classList.remove('active'),420);
 }
 private startIntro(){
  const intro=get('pulp-intro');
  intro.classList.toggle('visible',this.animationsEnabled);
  if(!this.animationsEnabled)return;
  this.introTimer=window.setTimeout(()=>intro.classList.remove('visible'),1600);
  // The intro is always non-blocking: old saves and menu controls remain clickable.
  intro.addEventListener('click',()=>this.dismissIntro(),{once:true});
  window.addEventListener('pointerdown',()=>this.dismissIntro(),{once:true,capture:true});
 }
 dismissIntro(){
  if(this.introTimer!==undefined)window.clearTimeout(this.introTimer);
  get('pulp-intro').classList.remove('visible');
 }
 private bind(){
  get('pulp-options-open').addEventListener('click',()=>this.open('options'));
  get('pulp-chapters-open').addEventListener('click',()=>this.open('chapters'));
  get('pulp-credits-open').addEventListener('click',()=>this.open('credits'));
  get('pulp-pause-access').addEventListener('click',()=>this.togglePause());
  get('pulp-resume').addEventListener('click',()=>this.close());
  get('pulp-options-from-pause').addEventListener('click',()=>this.open('options'));
  get('pulp-options-close').addEventListener('click',()=>this.close());
  get('pulp-chapters-close').addEventListener('click',()=>this.close());
  get('pulp-credits-close').addEventListener('click',()=>this.close());
  get('pulp-pause-save').addEventListener('click',()=>{this.actions.onSave();this.actions.uiSound('confirm');});
  get('pulp-pause-load').addEventListener('click',()=>{
   this.close();this.actions.onLoad();this.actions.uiSound('confirm');
  });
  get('pulp-menu-from-pause').addEventListener('click',()=>{
   this.close();this.actions.onMenu();this.actions.uiSound('confirm');
  });
  get('pulp-reset-settings').addEventListener('click',()=>{
   this.actions.setGraphics('psx');
   this.update(DEFAULT_PULP_SETTINGS);
   this.actions.uiSound('confirm');
  });
  const change=()=>this.update({
   grain:input('pulp-grain').checked,
   reducedMotion:input('pulp-reduce-motion').checked,
   highContrast:input('pulp-high-contrast').checked,
   largeText:input('pulp-large-text').checked,
   volume:Number(input('pulp-volume').value)
  });
  for(const id of ['pulp-grain','pulp-reduce-motion','pulp-high-contrast','pulp-large-text','pulp-volume'])
   input(id).addEventListener('change',change);
  input('pulp-volume').addEventListener('input',()=>{
   get('pulp-volume-value').textContent=input('pulp-volume').value+'%';
   change();
  });
  select('pulp-graphics').addEventListener('change',()=>{
   const choice=select('pulp-graphics').value as GraphicsPreset;
   if(!['psx','rendimiento','equilibrado','cine'].includes(choice))return;
   this.actions.setGraphics(choice);this.actions.uiSound('select');
  });
  // Capturing phase blocks game keybinds while a UI dialog owns the keyboard.
  window.addEventListener('keydown',e=>{
   if(this.screen===null)return;
   if(e.key==='Escape'){
    e.preventDefault();e.stopImmediatePropagation();this.close();return;
   }
   if(e.key==='Tab'){
    const panel=get(SCREEN_IDS[this.screen]);
    const controls=[...panel.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href]')]
      .filter(x=>x.offsetParent!==null);
    if(controls.length){
     const first=controls[0],last=controls[controls.length-1];
     if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
     else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
    e.stopImmediatePropagation();return;
   }
   // Allow native control keys (arrows, space, typing) within the modal,
   // but never forward the same input to the moving player.
   e.stopImmediatePropagation();
  },true);
 }
 private renderChapters(){
  const list=get('pulp-chapters-list');list.replaceChildren();
  const statusLabel:Record<ChapterSummary['status'],string>={
   completed:'ARCHIVADO',active:'EN EMISIÓN',available:'DISPONIBLE',locked:'CINTA PRECINTADA'
  };
  for(const ch of this.actions.getChapters()){
   const article=document.createElement('article');
   article.className='pulp-chapter '+ch.status;
   const number=document.createElement('span');number.textContent='Nº '+ch.number;
   const heading=document.createElement('h3');heading.textContent=ch.title;
   const foot=document.createElement('small');foot.textContent=ch.setting+' · '+statusLabel[ch.status];
   article.append(number,heading,foot);list.append(article);
  }
 }
 private syncControls(){
  select('pulp-graphics').value=this.actions.getGraphics();
  input('pulp-grain').checked=this.settings.grain;
  input('pulp-reduce-motion').checked=this.settings.reducedMotion;
  input('pulp-high-contrast').checked=this.settings.highContrast;
  input('pulp-large-text').checked=this.settings.largeText;
  input('pulp-volume').value=String(this.settings.volume);
  get('pulp-volume-value').textContent=this.settings.volume+'%';
 }
 private update(changes:Partial<PulpSettings>){
  this.settings=normalizePulpSettings({...this.settings,...changes});
  writePreference(this.actions.storage,PULP_PREF_KEY,JSON.stringify(this.settings));
  this.apply();this.syncControls();
 }
 private apply(){
  const root=document.documentElement;
  root.classList.toggle('pulp-grain',this.settings.grain);
  root.classList.toggle('pulp-reduce-motion',!this.animationsEnabled);
  root.classList.toggle('pulp-high-contrast',this.settings.highContrast);
  root.classList.toggle('pulp-large-text',this.settings.largeText);
  this.actions.setVolume(this.settings.volume/100);
 }
}
