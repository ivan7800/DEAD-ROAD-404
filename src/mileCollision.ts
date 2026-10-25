/** The impossible mile is an isolated walkable low-poly strip, not the legacy road. */
import {collides,type Box2} from './worldCollision.ts';
export const MILE_COLLIDERS:ReadonlyArray<Box2>=[
 {minX:-14,maxX:-10.8,minZ:-67,maxZ:8},
 {minX:10.8,maxX:14,minZ:-67,maxZ:8},
 {minX:-14,maxX:14,minZ:-69,maxZ:-63},
 {minX:-14,maxX:14,minZ:4.5,maxZ:8}
];
export const mileCollision=(x:number,z:number):boolean=>
 !Number.isFinite(x)||!Number.isFinite(z)||collides(x,z,.3,MILE_COLLIDERS);
