/** Counter, booths and boundary collision for THE LAST LIGHT; no collision with station. */
import type {Box2} from './worldCollision.ts';
import {collides} from './worldCollision.ts';
export const DINER_COLLIDERS:ReadonlyArray<Box2>=[
 {minX:-39,maxX:-38.45,minZ:8,maxZ:26},
 {minX:-23.55,maxX:-23,minZ:8,maxZ:26},
 {minX:-39,maxX:-23,minZ:7.8,maxZ:8.45},
 {minX:-39,maxX:-32.2,minZ:25.55,maxZ:26.2},
 {minX:-29.8,maxX:-23,minZ:25.55,maxZ:26.2},
 // Two booths away from quest items
 {minX:-37.8,maxX:-36.2,minZ:9.7,maxZ:11.7},
 {minX:-37.8,maxX:-36.2,minZ:13,maxZ:14.8},
 // Cook's counter: approach key pad from x=-29
 {minX:-26.7,maxX:-24.9,minZ:13,maxZ:19},
 // Kitchen divider; enter through the gap near x=-30
 {minX:-39,maxX:-32,minZ:12.45,maxZ:12.92},
 {minX:-28.2,maxX:-23,minZ:12.45,maxZ:12.92}
];
export function dinerCollision(x:number,z:number):boolean{
 return !Number.isFinite(x)||!Number.isFinite(z)||collides(x,z,.3,DINER_COLLIDERS);
}
