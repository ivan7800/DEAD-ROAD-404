/** Standard Gamepad mapping (Xbox/PlayStation). Pure normalization, safe when disconnected. */
export type PadInput={forward:number;strafe:number;lookX:number;lookY:number;sprint:boolean;buttons:ReadonlySet<string>};
export function stick(value:number|undefined,deadzone=.16):number{
 const DEAD=Number.isFinite(deadzone)?Math.max(.05,Math.min(.4,deadzone)):.16;
 const v=Number.isFinite(value)?Math.max(-1,Math.min(1,value!)):0;
 return Math.abs(v)<=DEAD?0:Math.sign(v)*(Math.abs(v)-DEAD)/(1-DEAD);
}
export function readPad(pad:Pick<Gamepad,'axes'|'buttons'|'mapping'>|null,deadzone=.16):PadInput{
 const buttons=new Set<string>();
 if(!pad||pad.mapping!=='standard')return {forward:0,strafe:0,lookX:0,lookY:0,sprint:false,buttons};
 const down=(i:number)=>Boolean(pad.buttons[i]?.pressed);
 // Standard mapping: A/Cross interact, X/Square attack, Y/Triangle flashlight,
 // B/Circle return, Start pause, Back map, LB sprint, D-pad extra movement.
 if(down(0))buttons.add('e');
 if(down(2)||down(7))buttons.add('f');
 if(down(3))buttons.add('t');
 if(down(1))buttons.add('m');
 if(down(9))buttons.add('escape');
 if(down(8))buttons.add('i');
 const forward=Math.max(-1,Math.min(1,-stick(pad.axes[1],deadzone)+(down(12)?1:0)-(down(13)?1:0)));
 const strafe=Math.max(-1,Math.min(1,stick(pad.axes[0],deadzone)+(down(15)?1:0)-(down(14)?1:0)));
 return {forward,strafe,lookX:stick(pad.axes[2],deadzone),lookY:stick(pad.axes[3],deadzone),
  sprint:down(4)||down(10),buttons};
}
