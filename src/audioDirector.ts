import {engineFrequency,soundMix,type SoundMode} from './audioMath.ts';

/** Sound synthesized locally. Started only after a click to satisfy autoplay policy. */
export class AudioDirector {
 private ctx:AudioContext|null=null;
 private master:GainNode|null=null;private volume=1;
 private engine:OscillatorNode|null=null;private engineOvertone:OscillatorNode|null=null;
 private engineGain:GainNode|null=null;private windGain:GainNode|null=null;private tensionGain:GainNode|null=null;
 start(){
  if(this.ctx){void this.ctx.resume();return;}
  const a=new AudioContext();this.ctx=a;
  const master=a.createGain();master.gain.value=.42*this.volume;master.connect(a.destination);this.master=master;
  const engine=a.createOscillator();engine.type='sawtooth';engine.frequency.value=42;
  const engineFilter=a.createBiquadFilter();engineFilter.type='lowpass';engineFilter.frequency.value=210;
  const engineGain=a.createGain();engineGain.gain.value=0;
  engine.connect(engineFilter).connect(engineGain).connect(master);engine.start();
  const overtone=a.createOscillator();overtone.type='triangle';overtone.frequency.value=84;
  const overtoneGain=a.createGain();overtoneGain.gain.value=.015;
  overtone.connect(overtoneGain).connect(engineGain);overtone.start();
  // Bound buffer and deterministic noise: 2 seconds of seamless wind at sample rate.
  const n=a.sampleRate*2,buf=a.createBuffer(1,n,a.sampleRate),data=buf.getChannelData(0);let seed=90841;
  for(let i=0;i<n;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;data[i]=((seed>>>0)/2147483648-1)*.6;}
  const noise=a.createBufferSource();noise.buffer=buf;noise.loop=true;
  const filter=a.createBiquadFilter();filter.type='lowpass';filter.frequency.value=440;filter.Q.value=.3;
  const windGain=a.createGain();windGain.gain.value=0;noise.connect(filter).connect(windGain).connect(master);noise.start();
  const tension=a.createOscillator();tension.type='sine';tension.frequency.value=56;
  const tensionGain=a.createGain();tensionGain.gain.value=0;tension.connect(tensionGain).connect(master);tension.start();
  this.engine=engine;this.engineOvertone=overtone;this.engineGain=engineGain;this.windGain=windGain;this.tensionGain=tensionGain;
 }
 /** Master volume applies consistently to ambient layers and UI/game effects. */
 setVolume(value:number){
  this.volume=Number.isFinite(value)?Math.min(1,Math.max(0,value)):1;
  if(this.ctx&&this.master)this.master.gain.setTargetAtTime(.42*this.volume,this.ctx.currentTime,.025);
 }
 getVolume(){return this.volume;}
 update(mode:SoundMode,speed:number){
  const a=this.ctx;if(!a)return;
  const t=a.currentTime,mix=soundMix(mode,speed),freq=engineFrequency(speed);
  this.engine?.frequency.setTargetAtTime(freq,t,.14);
  this.engineOvertone?.frequency.setTargetAtTime(freq*2.03,t,.14);
  this.engineGain?.gain.setTargetAtTime(mix.engine,t,.24);
  this.windGain?.gain.setTargetAtTime(mix.wind,t,.4);
  this.tensionGain?.gain.setTargetAtTime(mix.tension,t,.65);
 }
 beep(frequency:number,duration=.12){
  const a=this.ctx;if(!a)return;
  const osc=a.createOscillator(),gain=a.createGain(),t=a.currentTime;
  osc.type='triangle';osc.frequency.value=Math.max(30,Math.min(2200,frequency));
  gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.048,t+.013);
  gain.gain.exponentialRampToValueAtTime(.0001,t+Math.max(.07,duration));
  osc.connect(gain).connect(this.master??a.destination);osc.start(t);osc.stop(t+Math.max(.07,duration)+.025);
  osc.onended=()=>{osc.disconnect();gain.disconnect();};
 }
}
