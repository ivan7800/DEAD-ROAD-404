export const SCENE_TRANSITIONS = {
 map:     { cover: 105, reveal: 230, color: '#15101a', cue: 0 },
 drive:   { cover: 115, reveal: 270, color: '#1a1610', cue: 46 },
 station: { cover: 150, reveal: 345, color: '#26160f', cue: 87 },
 diner:   { cover: 165, reveal: 390, color: '#2c1520', cue: 117 },
 town:    { cover: 185, reveal: 415, color: '#101f23', cue: 73 },
 radio:   { cover: 135, reveal: 370, color: '#0d1c2b', cue: 217 },
 bunker:  { cover: 210, reveal: 425, color: '#100d19', cue: 54 },
 mile:    { cover: 190, reveal: 440, color: '#281b17', cue: 96 },
 'road-end': { cover: 220, reveal: 480, color: '#281723', cue: 60 },
} as const;
export type SceneDestination = keyof typeof SCENE_TRANSITIONS;

const ease = (t: number) => t * t * (3 - 2 * t);

/** Runs on the visible game clock. The destination is applied once, under cover. */
export class SceneTransition {
 private elapsed = 0;
 private duration = 0;
 private opacity = 0;
 private from = 0;
 private commit: (() => void) | null = null;
 private destination: SceneDestination = 'map';

 get active() { return this.duration > 0; }
 get covered() { return this.commit !== null; }

 start(destination: SceneDestination, apply: () => void, animated: boolean) {
  if (this.covered) return false;
  if (!animated) {
   this.cancel();
   apply();
   return true;
  }
  this.destination = destination;
  this.from = this.opacity;
  this.elapsed = 0;
  const { cover, reveal } = SCENE_TRANSITIONS[destination];
  this.duration = cover + reveal;
  this.commit = apply;
  return true;
 }

 advance(milliseconds: number) {
  if (!this.active) return 0;
  const { cover, reveal } = SCENE_TRANSITIONS[this.destination];
  this.elapsed += Math.max(0, milliseconds);
  if (this.commit && this.elapsed >= cover) {
   // Keep the first frame of the new scene fully covered, even after a slow frame.
   this.elapsed = cover;
   this.opacity = 1;
   const apply = this.commit;
   this.commit = null;
   apply();
   return 1;
  }
  if (this.elapsed >= this.duration) {
   this.cancel();
  } else if (this.covered) {
   this.opacity = this.from + (1 - this.from) * ease(this.elapsed / cover);
  } else {
   this.opacity = 1 - ease((this.elapsed - cover) / reveal);
  }
  return this.opacity;
 }

 cancel() {
  this.duration = 0;
  this.opacity = 0;
  this.commit = null;
 }
}
