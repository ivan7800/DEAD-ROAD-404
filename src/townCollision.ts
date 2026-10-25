/** F23: collision for the nameless town, separate from motel and diner. */
import type {Box2} from './worldCollision.ts';
import {collides} from './worldCollision.ts';
export const TOWN_WALLS:ReadonlyArray<Box2>=[
 // Borded up dwellings along western side. Main street x6..23 stays clear.
 {minX:-4,maxX:3.4,minZ:-48.5,maxZ:-34},
 {minX:-4,maxX:3.4,minZ:-59,maxZ:-52},
 // Archive row on eastern pavement, with reachable props to the west.
 {minX:29.2,maxX:35,minZ:-52,maxZ:-40},
 {minX:29.2,maxX:35,minZ:-38,maxZ:-28},
 // Church body: approach its western doorway at x12, z-55.
 {minX:17.8,maxX:25,minZ:-62,maxZ:-53.5},
 {minX:0,maxX:5,minZ:-62,maxZ:-53.5},
 // Burned patrol car near the back of the main street.
 {minX:20,maxX:22.4,minZ:-49,maxZ:-47}
];
export const townCollision=(x:number,z:number):boolean=>
 !Number.isFinite(x)||!Number.isFinite(z)||collides(x,z,.3,TOWN_WALLS);
