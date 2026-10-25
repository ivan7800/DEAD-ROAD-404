import * as THREE from 'three';
import {driveFeedback} from './drivingFeedback.ts';
import type {GraphicsPreset} from './quality.ts';
/** Single-draw-call particle system: wheel dust persists in world space after the car passes. */
export class DriveDust {
  readonly mesh:THREE.InstancedMesh;
  private readonly dummy=new THREE.Object3D();
  private readonly particles=Array.from({length:40},()=>({x:0,y:0,z:0,age:99,life:1,size:0}));
  private index=0;private accumulator=0;private phase=0;private preset:GraphicsPreset='psx';
  constructor(world:THREE.Scene){
    const material=new THREE.MeshBasicMaterial({color:0xd9b6a0,transparent:true,opacity:.22,depthWrite:false,side:THREE.DoubleSide});
    this.mesh=new THREE.InstancedMesh(new THREE.CircleGeometry(.5,9),material,this.particles.length);
    this.mesh.frustumCulled=false;this.mesh.count=0;world.add(this.mesh);
  }
  setPreset(preset:GraphicsPreset){this.preset=preset;if(preset==='psx'||preset==='rendimiento')this.mesh.count=0;}
  update(dt:number,car:THREE.Object3D,speed:number,steering:number,enabled:boolean){
    const delta=Math.max(0,Math.min(.07,Number.isFinite(dt)?dt:0));
    this.phase+=delta;
    const feedback=driveFeedback(speed,steering,this.preset);
    const active=enabled&&feedback.particlesPerSecond>0&&this.preset!=='psx'&&this.preset!=='rendimiento';
    this.accumulator=active?Math.min(2,this.accumulator+feedback.particlesPerSecond*delta):0;
    if(active){
      car.updateWorldMatrix(true,false);
      while(this.accumulator>=1){
        this.accumulator-=1;
        const p=this.particles[this.index];this.index=(this.index+1)%this.particles.length;
        // Two rear-wheel emitters, with deterministic jitter and no global random state.
        const side=this.index%2===0?-1:1;
        const pos=car.localToWorld(new THREE.Vector3(side*1.15,.05,1.78));
        p.x=pos.x+Math.sin(this.phase*8+this.index)*.16;
        p.z=pos.z+Math.cos(this.phase*5+this.index)*.16;
        p.y=Math.max(.12,pos.y+.02);p.age=0;p.life=.7+this.index%4*.12;p.size=.2+feedback.intensity*.24;
      }
    }
    if(this.preset==='psx'||this.preset==='rendimiento'){this.mesh.count=0;return;}
    let n=0;
    for(const p of this.particles){
      p.age+=delta;if(p.age>=p.life)continue;
      const ratio=p.age/p.life;
      this.dummy.position.set(p.x+ratio*.42,p.y+ratio*.3,p.z+ratio*.6);
      this.dummy.rotation.set(-Math.PI/2,0,0);
      this.dummy.scale.setScalar(Math.max(.001,p.size*(1+ratio*2.4)*(1-ratio*.72)));
      this.dummy.updateMatrix();this.mesh.setMatrixAt(n++,this.dummy.matrix);
    }
    this.mesh.count=n;
    this.mesh.instanceMatrix.needsUpdate=true;
  }
  dispose(){this.mesh.geometry.dispose();(this.mesh.material as THREE.Material).dispose();}
}
