/** Display-only analog-video aesthetic; kept outside game-state saves. */
export type FilmLook='suave'|'apagado';
export function normalizeFilmLook(input:unknown):FilmLook {return input==='apagado'?'apagado':'suave';}
export function toggleFilmLook(current:unknown):FilmLook {return normalizeFilmLook(current)==='suave'?'apagado':'suave';}
/** User's reduced-motion preference is a hard stop for animated artifacts. */
export function allowAnalogMotion(enabled:boolean,reducedMotion:boolean):boolean {return enabled&&!reducedMotion;}
