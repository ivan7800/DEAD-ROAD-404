/** F35: deterministic, inexpensive PSX palettes, zero additional draw calls. */
export type ChapterAtmosphere35=Readonly<{sky:number;fog:number;density:number;hemisphereSky:number;hemisphereGround:number;ambientIntensity:number;moonColor:number;moonIntensity:number}>;
const profiles:readonly ChapterAtmosphere35[]=[
 {sky:0x211d2c,fog:0x332c3a,density:.031,hemisphereSky:0xa69ab7,hemisphereGround:0x65403c,ambientIntensity:2.05,moonColor:0xb7b2cf,moonIntensity:2.2},
 {sky:0x211b28,fog:0x392b37,density:.030,hemisphereSky:0xb6a0ab,hemisphereGround:0x68463d,ambientIntensity:2.10,moonColor:0xc8aab5,moonIntensity:2.15},
 {sky:0x19252c,fog:0x2b3a40,density:.029,hemisphereSky:0x9db4b6,hemisphereGround:0x455859,ambientIntensity:2.1,moonColor:0xa8c4c5,moonIntensity:2.15},
 {sky:0x14202d,fog:0x243a48,density:.032,hemisphereSky:0x88b4ca,hemisphereGround:0x354f60,ambientIntensity:1.9,moonColor:0xa1c6e0,moonIntensity:2.0},
 {sky:0x2c1e27,fog:0x48303b,density:.032,hemisphereSky:0xbda1a5,hemisphereGround:0x755049,ambientIntensity:1.95,moonColor:0xd3afb2,moonIntensity:2.05},
 {sky:0x25202e,fog:0x3a3348,density:.034,hemisphereSky:0xb8adc9,hemisphereGround:0x58495e,ambientIntensity:2,moonColor:0xc6c0dc,moonIntensity:2.1}
];
export function chapterAtmosphere35(chapter:number):ChapterAtmosphere35{
 return profiles[Number.isInteger(chapter)&&chapter>=1&&chapter<=6?chapter-1:0];
}
