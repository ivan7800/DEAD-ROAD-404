# DEAD ROAD 404 · FASE 27 — Donde termina la carretera

**Versión objetivo:** 0.21.0 · Capítulo VI de VI. La historia principal alcanza el último peaje (KM 120) con cuatro finales originales.

## Recorrido jugable
Completar V → conducir hasta KM 120 → entrar al último desvío desde el mapa → leer señal → registro de peajes de 1992 → activar relés A/B en cualquier orden → resolver panel **1204** (KM 120 + primera cifra de carretera 404) → confrontar a **El Doble** (140 PV, ataque anunciado, recuperación y dos ritmos) → decisión final.

La carretera se construye con geometría low-poly propia, carteles pixelados, pasos elevados y malla de colisión independiente; mantiene la selección PSX 240p y no carga GLB ajenos. El peaje incluye un botiquín de recogida única (+20 salud y +1 pieza).

## Cuatro desenlaces
- I: **Amanecer prestado**, escapar con Vera y recursos mínimos.
- II: **El peaje**, salir sin las condiciones de rescate.
- III: **Kilómetro 404**, escuchar la radio y quedar atrapado en el bucle.
- IV secreto: **El coro de los ausentes**, escuchar después de transmitir los nombres desde el pueblo (III), emitir desde WXR-404 (IV) y conservar el mapa (V). El final honra las decisiones anteriores.

El estado final se registra una sola vez, con el capítulo VI marcado como completado. Los finales son inmutables una vez guardados.

## Compatibilidad
Se conserva el formato de estado `version:2`, la misma clave de localStorage `dead-road-404-f19-v2` y lectura desde guardados F18/F17/F16 y anteriores. Una partida de fase 26 sin `chapterSix` mantiene la opción de acceder al epílogo previo; una partida nueva debe completar VI. No reescribir ni duplicar recursos o hitos al cargar.

## QA y criterios de integración
```bash
npm test
npm run build
node scripts/check-pages-build.mjs
npm run smoke
```
El smoke Chromium debe atravesar físicamente el nivel, fallar y acertar el código, derrotar al Doble con golpes reales, elegir final, guardar/cargar y comprobar la ausencia de excepciones JS.

Que los capítulos I–VI sean jugables no demuestra por sí solo que el juego alcance una puntuación 9,5/10 ni sustituye las pruebas manuales en Windows y Linux. Resta hacer una auditoría visual, de rendimiento y accesibilidad por dispositivo.
