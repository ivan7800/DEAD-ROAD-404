import test from 'node:test';import assert from 'node:assert/strict';
import {
 DEFAULT_PULP_SETTINGS,PULP_PREF_KEY,normalizePulpSettings,parsePulpSettings,
 shouldAnimatePulp,titleForLocation,PULP_SCREENS
} from '../src/ui/pulpSettings.ts';
test('ajustes noventeros iniciales legibles sin animaciones obligatorias',()=>{
 assert.equal(DEFAULT_PULP_SETTINGS.grain,true);
 assert.equal(DEFAULT_PULP_SETTINGS.highContrast,false);
 assert.equal(DEFAULT_PULP_SETTINGS.volume,65);
 assert.equal(PULP_PREF_KEY,'dead-road-404-pulp-ui-v1');
});
test('lee y sanea ajustes guardados con datos corruptos',()=>{
 assert.deepEqual(parsePulpSettings('{bad'),DEFAULT_PULP_SETTINGS);
 assert.deepEqual(parsePulpSettings(null),DEFAULT_PULP_SETTINGS);
 assert.deepEqual(parsePulpSettings(JSON.stringify({volume:999,grain:'yes',largeText:true,reducedMotion:false})),
  {...DEFAULT_PULP_SETTINGS,volume:100,largeText:true});
 assert.equal(normalizePulpSettings({volume:-100}).volume,0);
 assert.equal(normalizePulpSettings({volume:NaN}).volume,65);
 assert.equal(normalizePulpSettings({volume:38.7}).volume,39);
});
test('respeta las preferencias de movimiento reducido del usuario y del sistema',()=>{
 assert.equal(shouldAnimatePulp(false,false),true);
 assert.equal(shouldAnimatePulp(true,false),false);
 assert.equal(shouldAnimatePulp(false,true),false);
 assert.equal(shouldAnimatePulp(true,true),false);
});
test('cartelas identifican capítulos y lugar sin importar contenido privado',()=>{
 assert.match(titleForLocation('map').title,/TRANSMISIÓN/);
 assert.match(titleForLocation('drive').eyebrow,/CARRETERA/);
 assert.match(titleForLocation('explore','station').title,/ÚLTIMA PARADA/);
 assert.match(titleForLocation('explore','diner').title,/LAST LIGHT/);
 assert.match(titleForLocation('explore','town').title,/PUEBLO SIN NOMBRE/);
});
test('menús definidos incluyen pausa, opciones, créditos y archivo',()=>{
 assert.deepEqual(PULP_SCREENS,['pause','options','chapters','credits']);
});
