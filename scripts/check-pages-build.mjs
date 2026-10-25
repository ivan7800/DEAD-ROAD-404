import {readFileSync, existsSync, readdirSync, statSync} from 'node:fs';
import {resolve, dirname, join} from 'node:path';

const dist=resolve('dist');
const prefix='/DEAD-ROAD-404/';
const indexFile=join(dist,'index.html');
if(!existsSync(indexFile)) throw new Error('Falta dist/index.html');
const html=readFileSync(indexFile,'utf8');
if(/src=["']\/src\/main\.ts["']/.test(html))throw new Error('El HTML publicado sigue apuntando a TypeScript sin compilar.');
const scripts=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)].map(m=>m[1]);
if(scripts.length===0)throw new Error('No se encontró el JavaScript compilado de Vite.');
const styles=[...html.matchAll(/<link\b[^>]*\bhref=["']([^"']+\.css)["']/g)].map(m=>m[1]);
function verifyAsset(url){
 if(!url.startsWith(prefix))throw new Error('URL incompatible con GitHub Pages: '+url);
 const rel=decodeURIComponent(url.slice(prefix.length));
 if(!rel || rel.includes('..'))throw new Error('Ruta inesperada: '+url);
 const target=join(dist,rel);
 if(!existsSync(target)||!statSync(target).isFile())throw new Error('Falta recurso del HTML: '+url);
 return target;
}
scripts.concat(styles).forEach(verifyAsset);
for(const file of ['firebird_77.glb','sunspur_station.glb','mile404_motel.glb']){
 const model=join(dist,'models',file);
 if(!existsSync(model)||statSync(model).size<10000)throw new Error('GLB no incluido o incompleto: '+file);
}
const js=scripts.map(verifyAsset).map(p=>readFileSync(p,'utf8')).join('\n');
if(!js.includes('firebird_77.glb'))throw new Error('No se encontró la referencia al modelo principal en JS compilado.');
console.log('PASS GitHub Pages: HTML compilado, rutas correctas, CSS/JS presentes y tres GLB incluidos.');
