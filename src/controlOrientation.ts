/** Camera heading and movement must agree in Three.js (forward local -Z). */
export function cameraYawForMovement(yaw:number):number{return -yaw;}
