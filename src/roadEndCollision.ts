/** Separate walkable final toll-road, static collision budget. */
import {collides,type Box2} from './worldCollision.ts';
export const END_COLLIDERS:ReadonlyArray<Box2>=[
 {minX:-14,maxX:-10.8,minZ:-67,maxZ:7},
 {minX:10.8,maxX:14,minZ:-67,maxZ:7},
 {minX:-14,maxX:14,minZ:-68,maxZ:-63},
 {minX:-14,maxX:14,minZ:4.5,maxZ:8},
 {minX:-10,maxX:-7.8,minZ:-25,maxZ:-17},
 {minX:7.8,maxX:10,minZ:-25,maxZ:-17}
];
export const roadEndCollision=(x:number,z:number):boolean=>
 !Number.isFinite(x)||!Number.isFinite(z)||collides(x,z,.3,END_COLLIDERS);
