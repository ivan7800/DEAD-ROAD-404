/** Control ownership is independent of DOM and rendering. No keys remain stuck after dialogs. */
export type ControlMode='map'|'drive'|'explore';
export function normalizeKey(key:string):string {
  const k=key.toLowerCase();
  return k==='space'||k==='spacebar'?' ':k;
}
export function capturesGameKey(key:string, mode:ControlMode):boolean {
  const k=normalizeKey(key);
  return ['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift',' ','c','l','e','r','t','j','g','h','m','p','f','f3','v','escape'].includes(k)
    && !(mode==='map' && ['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift',' '].includes(k));
}
export class InputController {
  readonly keys=new Set<string>();
  press(key:string){this.keys.add(normalizeKey(key));}
  release(key:string){this.keys.delete(normalizeKey(key));}
  reset(){this.keys.clear();}
  down(...codes:string[]){return codes.some(k=>this.keys.has(normalizeKey(k)));}
  axis(positive:string[],negative:string[]):number{return Number(this.down(...positive))-Number(this.down(...negative));}
  active(){return this.keys.size;}
}
