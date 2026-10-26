/** Prefer active keyboard direction, otherwise allow analog controller input. */
export function chooseAxis(keyboard:number,gamepad:number):number {
 return keyboard!==0?keyboard:gamepad;
}
