# DEAD ROAD 404 — Fase 26: El kilómetro imposible (capítulo V)

## Identidad
**1992. KM 96.** La carretera lleva veinticuatro kilómetros anunciando la misma distancia. El jugador sale de la emisora WXR-404 con una decisión que vuelve a escucharse en una caja registradora de patrulla abandonada. Las balizas de una carretera que no aparece en el mapa no miden longitud: miden aquello que el viajero recuerda.

## Implementación de la rama F26
- Nueva área física low-poly PSX, independiente del escenario de carretera, en TypeScript y Three.js, sin activos remotos ni GLB.
- Acceso en el mapa al completar IV y alcanzar el KM 96. Entrada real con WASD, E, F, Shift, M, I, J.
- Misión: poste repetido → registrador → dos balizas independientes A/B → dial ambiental **2496** (24 km entre 72 y 96) → **El Agrimensor** → decisión irreversible.
- Agrimensor con IA de aproximación, máscara avisadora de ataque, fase de recuperación, daño por proximidad y golpes orientados de 30 puntos sobre 120 PV.
- Recurso opcional no repetible: maleta de patrulla (+18 salud, +2 comida).
- Consecuencias: recordar a los desaparecidos (+12 L) o enterrar el mapa (+3 piezas). Las señales narrativas varían según la decisión de la emisora.
- Guardado `dead-road-404-f19-v2`, `version:2` sin ruptura. Las partidas de fase 25 sin campo de capítulo V preservan su antiguo epílogo histórico. En las partidas nuevas, el epílogo exige terminar V.
- Capítulo VI no implementado: el antiguo final del KM 120 es provisional y su transformación en final narrativo de seis capítulos será trabajo de fase 27.

## Control de calidad
```bash
npm test
npm run build
node scripts/check-pages-build.mjs
npm run smoke
```

**Estado de CI:** completada la prueba real de Chrome con ambas balizas, código fallido y correcto, combate, decisión, guardado/carga, sin errores JS. Ejecución: https://github.com/ivan7800/DEAD-ROAD-404/actions/runs/40217843970

Aún deben comprobarse manualmente accesibilidad completa, legibilidad visual, fluidez en GPU real y una partida larga de principio a fin. No afirmar 9,5/10 sin esas pruebas.
