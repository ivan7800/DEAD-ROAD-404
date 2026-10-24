/** Reglas independientes del renderizado: resistentes a FPS variables. */
export const MAX_STAMINA = 100;
export function stepStamina(current:number, running:boolean, dt:number):number {
  if (!Number.isFinite(dt) || dt <= 0) return Math.max(0,Math.min(MAX_STAMINA,current));
  const change = (running ? -27 : 18)*Math.min(dt,.25);
  return Math.max(0,Math.min(MAX_STAMINA,current+change));
}
export function canSprint(stamina:number, moving:boolean, requested:boolean):boolean {
  return moving && requested && stamina > 3;
}
export function movementSpeed(sprinting:boolean):number {return sprinting ? 6.5 : 4;}
export function explorationHint(stage:string, torch:boolean):string {
  const goal = stage==='arrival'?'Escucha la radio':stage==='signal'?'Busca la llave':stage==='key'?'Habla con Vera':'Regresa al coche';
  return `${goal} · Linterna ${torch?'encendida':'apagada'} [T] · Diario [J] · Correr [SHIFT]`;
}
