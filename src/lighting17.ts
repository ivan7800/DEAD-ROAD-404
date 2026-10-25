import * as THREE from 'three';
import type {GraphicsPreset} from './quality.ts';

/** Fase 17: light budget for the three authored models. No real-time shadows on neon. */
export class AmericanaLighting17 {
 readonly group=new THREE.Group();
 private sodium=new THREE.PointLight(0xffae67,22,16,2);
 private stationInterior=new THREE.PointLight(0xa3c9bb,11,13,2);
 private motelLamp=new THREE.PointLight(0xff9b72,14,10,2);
 private reduced=false;
 constructor(){
  this.sodium.position.set(14.3,4.1,5.9);
  this.stationInterior.position.set(16,3.25,-5.2);
  this.motelLamp.position.set(-20.3,2.68,-41.2);
  for(const light of [this.sodium,this.stationInterior,this.motelLamp]){
   light.castShadow=false;
   this.group.add(light);
  }
 }
 setGraphics(preset:GraphicsPreset){
  this.reduced=preset==='rendimiento'||preset==='psx';
  this.stationInterior.visible=!this.reduced;
  this.motelLamp.visible=!this.reduced;
  this.sodium.intensity=this.reduced?12:22;
 }
 animate(time:number,reducedMotion:boolean){
  if(reducedMotion)return;
  // Slow and subtle sodium buzz, not a flashing-strobe effect.
  this.sodium.intensity=(this.reduced?12:22)*(0.985+0.015*Math.sin(time*2.2));
 }
}
