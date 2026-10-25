/** Defensive browser storage: a blocked or malformed newest save must not hide older saves. */
export interface ReadStore {getItem(key:string):string|null}
export interface WriteStore {setItem(key:string,value:string):void}
export function safeStorage():Storage|null {
  try{return typeof window==='undefined'?null:window.localStorage;}catch{return null;}
}
export function readPreference(store:ReadStore|null,key:string):string|null {
  try{return store?.getItem(key)??null;}catch{return null;}
}
export function writePreference(store:WriteStore|null,key:string,value:string):boolean {
  try{if(!store)return false;store.setItem(key,value);return true;}catch{return false;}
}
export function writeSave(store:WriteStore|null,key:string,value:unknown):boolean {
  try{if(!store)return false;store.setItem(key,JSON.stringify(value));return true;}catch{return false;}
}
export function readLatestValidSave<T>(store:ReadStore|null, keys:readonly string[], normalize:(value:unknown)=>T|null):T|null {
  if(!store)return null;
  for(const key of keys){
    try{const raw=store.getItem(key);if(!raw)continue;const parsed=normalize(JSON.parse(raw));if(parsed!==null)return parsed;}
    catch{/* A corrupt value or blocked key must not block the next version. */}
  }
  return null;
}
