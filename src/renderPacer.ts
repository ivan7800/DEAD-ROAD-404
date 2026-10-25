/** Render cadence separate from simulation. Gameplay renders every visible rAF; 
 * static menus/paused dialogues redraw at a bounded cadence; hidden tabs do not render. */
export class RenderPacer {
 private lastDraw=-Infinity;
 readonly idleIntervalMs:number;
 constructor(idleFps=12){this.idleIntervalMs=1000/idleFps;}
 shouldRender(now:number,visible:boolean,interactive:boolean):boolean{
  if(!visible||!Number.isFinite(now)){
   this.lastDraw=-Infinity;return false;
  }
  if(interactive){this.lastDraw=now;return true;}
  if(now-this.lastDraw>=this.idleIntervalMs){
   this.lastDraw=now;return true;
  }
  return false;
 }
 reset(){this.lastDraw=-Infinity;}
}
