export const CAMERA_MODES=['chase','hood','cockpit','front'] as const;
export type CameraMode=typeof CAMERA_MODES[number];
export const CAMERA_LABELS:Record<CameraMode,string>={chase:'PERSECUCIÓN',hood:'CAPÓ',cockpit:'INTERIOR',front:'CINEMÁTICA'};
export function validCamera(value:unknown):CameraMode{return CAMERA_MODES.includes(value as CameraMode)?value as CameraMode:'chase';}
export function nextCamera(value:CameraMode):CameraMode{return CAMERA_MODES[(CAMERA_MODES.indexOf(value)+1)%CAMERA_MODES.length];}
