/** F25 separate radio facility / underground collision. No expensive physics engine. */
import {collides,type Box2} from './worldCollision.ts';
export const RADIO_COLLIDERS:ReadonlyArray<Box2>=[
 // Surface: two soundproofed studios left/right of the central passage.
 {minX:-34,maxX:-29.1,minZ:-49,maxZ:-38.7},
 {minX:-14.2,maxX:-10.5,minZ:-49,maxZ:-38.7},
 // The huge transmission support stands beyond the playable studio corridor.
 {minX:-30.7,maxX:-29.2,minZ:-60,maxZ:-51},
 {minX:-14,maxX:-12.3,minZ:-60,maxZ:-51},
 // Underground enclosure: corridor and open containment cell with access from z=32.
 {minX:-31.7,maxX:-30.4,minZ:30,maxZ:44},
 {minX:-13.6,maxX:-12.3,minZ:30,maxZ:44},
 {minX:-32,maxX:-12,minZ:43.6,maxZ:44.8},
 {minX:-32,maxX:-26.5,minZ:29.6,maxZ:30.5},
 {minX:-17.5,maxX:-12,minZ:29.6,maxZ:30.5},
 // Machinery at the sides of the bunker, away from the central corridor.
 {minX:-29.5,maxX:-27.9,minZ:36,maxZ:41},
 {minX:-16.1,maxX:-14.6,minZ:36,maxZ:41}
];
export const radioCollision=(x:number,z:number):boolean=>
 !Number.isFinite(x)||!Number.isFinite(z)||collides(x,z,.30,RADIO_COLLIDERS);
