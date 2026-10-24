/** Rolling FPS meter; stores a bounded window and excludes inactive-tab stalls. */
export class FrameMetrics {
 private readonly samples=new Float64Array(120);private sum=0;private size=0;private cursor=0;
 add(deltaMs:number){
  if(!Number.isFinite(deltaMs)||deltaMs<=0||deltaMs>250)return;
  if(this.size===this.samples.length)this.sum-=this.samples[this.cursor];else this.size++;
  this.samples[this.cursor]=deltaMs;this.sum+=deltaMs;
  this.cursor=(this.cursor+1)%this.samples.length;
 }
 fps():number{return this.size?1000*this.size/this.sum:0;}
 /** Slowest 1% frame time in the current bounded window, a conservative hitch indicator. */
 lowFps():number{if(!this.size)return 0;const sorted=Array.from(this.samples.subarray(0,this.size)).sort((a,b)=>b-a);const count=Math.max(1,Math.ceil(sorted.length*.01));const slow=sorted.slice(0,count).reduce((sum,v)=>sum+v,0)/count;return slow>0?1000/slow:0;}
 count():number{return this.size;}
 reset(){this.samples.fill(0);this.sum=0;this.size=0;this.cursor=0;}
}
