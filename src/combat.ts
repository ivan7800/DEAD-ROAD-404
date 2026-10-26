import {clamp} from './state.ts';
import {STATION_COLLIDERS} from './worldCollision.ts';
export interface EnemyState {x:number;z:number;health:number;alive:boolean;attackCooldown:number;wander:number;stagger?:number}
export interface Obstacle {minX:number;maxX:number;minZ:number;maxZ:number}
export const STATION_OBSTACLES:Obstacle[]=STATION_COLLIDERS.slice();
export const createEnemy=():EnemyState=>({x:17,z:-6,health:75,alive:true,attackCooldown:0,wander:0,stagger:0});
export const distance=(ax:number,az:number,bx:number,bz:number)=>Math.hypot(ax-bx,az-bz);
export function blocked(x:number,z:number,obstacles:Obstacle[]=STATION_OBSTACLES,r=.34){return obstacles.some(o=>x+r>o.minX&&x-r<o.maxX&&z+r>o.minZ&&z-r<o.maxZ);}
export function clearSight(x:number,z:number,tx:number,tz:number,obstacles:Obstacle[]=STATION_OBSTACLES){const d=distance(x,z,tx,tz);for(let t=.35;t<d;t+=.35){const k=t/d;if(blocked(x+(tx-x)*k,z+(tz-z)*k,obstacles,.12))return false;}return true;}
export function updateEnemy(e:EnemyState,px:number,pz:number,dt:number,obstacles:Obstacle[]=STATION_OBSTACLES):{enemy:EnemyState;hit:boolean;alert:boolean}{
 const n={...e};if(!n.alive)return {enemy:n,hit:false,alert:false};
 dt=clamp(dt,0,.1);n.attackCooldown=Math.max(0,n.attackCooldown-dt);n.stagger=Math.max(0,(n.stagger??0)-dt);n.wander+=dt;
 const d=distance(n.x,n.z,px,pz),sight=clearSight(n.x,n.z,px,pz,obstacles),alert=d<11&&sight;
 let tx=17+Math.sin(n.wander*.7)*2,tz=-6+Math.cos(n.wander*.7)*1.5;
 if(alert){tx=px;tz=pz;}
 if((n.stagger??0)===0){const md=distance(n.x,n.z,tx,tz);if(md>.15){const step=Math.min(md,(alert?1.32:.6)*dt);const dx=(tx-n.x)/md*step,dz=(tz-n.z)/md*step;
 if(!blocked(n.x+dx,n.z+dz,obstacles)){n.x+=dx;n.z+=dz;}
 else if(!blocked(n.x+dx,n.z,obstacles))n.x+=dx;
 else if(!blocked(n.x,n.z+dz,obstacles))n.z+=dz;
 }}
 const hit=alert&&distance(n.x,n.z,px,pz)<1.7&&n.attackCooldown===0&&(n.stagger??0)===0;
 if(hit)n.attackCooldown=1.7;
 return {enemy:n,hit,alert};
}
export function strike(e:EnemyState,px:number,pz:number,damage=25,yaw?:number):{enemy:EnemyState;hit:boolean;defeated:boolean}{
 const d=distance(e.x,e.z,px,pz);if(!e.alive||d>2.7||d<.001||!clearSight(px,pz,e.x,e.z))return {enemy:{...e},hit:false,defeated:false};
 if(yaw!==undefined){const facingX=Math.sin(yaw),facingZ=-Math.cos(yaw);if(((e.x-px)*facingX+(e.z-pz)*facingZ)/d<.45)return {enemy:{...e},hit:false,defeated:false};}
 const health=Math.max(0,e.health-damage);const awayX=(e.x-px)/d,awayZ=(e.z-pz)/d;
 const nx=e.x+awayX*.42,nz=e.z+awayZ*.42;
 return {enemy:{...e,health,alive:health>0,stagger:health>0?.42:0,x:blocked(nx,nz)?e.x:nx,z:blocked(nx,nz)?e.z:nz},hit:true,defeated:health===0};
}
