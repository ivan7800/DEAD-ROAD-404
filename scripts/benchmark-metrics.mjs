/** Summary of raw foreground requestAnimationFrame intervals, not claimed GPU frametimes. */
export function frameSummary(intervals){
 const valid=intervals.filter(v=>Number.isFinite(v)&&v>0&&v<=1000);
 if(!valid.length)return {frames:0,meanFps:0,low1Fps:0,p95FrameMs:0,maxFrameMs:0};
 const sorted=[...valid].sort((a,b)=>a-b),total=valid.reduce((a,v)=>a+v,0);
 const slowCount=Math.max(1,Math.ceil(valid.length*.01));
 const slow=sorted.slice(-slowCount).reduce((a,v)=>a+v,0)/slowCount;
 const round=v=>Math.round(v*100)/100;
 return {frames:valid.length,meanFps:round(1000*valid.length/total),
  low1Fps:round(1000/slow),p95FrameMs:round(sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*.95)-1)]),
  maxFrameMs:round(sorted[sorted.length-1])};
}
export function frameSummaryText(s){
 return `${s.meanFps.toFixed(2)} FPS medios | 1% bajo ${s.low1Fps.toFixed(2)} FPS | p95 ${s.p95FrameMs.toFixed(2)} ms | ${s.frames} fotogramas`;
}
